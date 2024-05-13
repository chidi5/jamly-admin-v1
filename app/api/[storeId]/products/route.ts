import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";
import { Prisma } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await request.json();

    const {
      name,
      price,
      handle,
      description,
      categoryId,
      images,
      variants,
      options,
      isFeatured,
      isArchived,
    } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!images || !images.length) {
      return new NextResponse("Images are required", { status: 400 });
    }

    if (!variants || !variants.length) {
      return new NextResponse("Variants are required", { status: 400 });
    }

    if (!options || !options.length) {
      return new NextResponse("Options are required", { status: 400 });
    }

    if (!price) {
      return new NextResponse("Price is required", { status: 400 });
    }

    if (!handle) {
      return new NextResponse("Handle is required", { status: 400 });
    }

    if (!description) {
      return new NextResponse("Description is required", { status: 400 });
    }

    if (!categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        AND: [{ id: params.storeId }, { users: { some: { id: userId } } }],
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    // Start transaction
    const product = await prismadb.$transaction(
      async (prisma) => {
        const product = await prisma.product.create({
          data: {
            name,
            price,
            handle,
            description,
            isFeatured,
            isArchived,
            categoryId,
            storeId: params.storeId,
            images: {
              createMany: {
                data: [...images.map((image: { url: string }) => image)],
              },
            },
          },
        });

        // Create options and option values
        const optionData: any[] = [];
        for (const option of options) {
          const newOption = await prisma.option.create({
            data: {
              productId: product.id,
              name: option.optionName,
            },
          });

          optionData.push(
            ...option.optionValues.map((value: { name: any }) => ({
              value: value.name, // Use "name" from optionValues for clarity
              optionId: newOption.id,
            }))
          );
        }

        if (optionData.length > 0) {
          await prisma.optionValue.createMany({
            data: optionData,
            skipDuplicates: true,
          });
        }

        // Create variants with option references:
        const promises = optionData.map(async (optionValue) => {
          return prisma.optionValue.findFirst({ where: optionValue });
        });

        const optionValues = await Promise.all(promises);

        const variantData = variants.map(
          (variant: { title: string; price: any; inventory: any }) => {
            let selectedOptionValues = [];

            // Check if the title contains "/"
            if (variant.title.includes("/")) {
              const splitTitle = variant.title.split("/"); // Assuming "/" is the separator

              const optionValueData = splitTitle.map((value) => ({
                value,
              }));

              // Find matching optionValues based on name
              selectedOptionValues = optionValueData.map((optionValue) => {
                const matchingOptionValue = optionValues.find(
                  (data) => data!.value === optionValue.value
                );

                if (!matchingOptionValue) {
                  throw new Error(
                    `Option value "${optionValue.value}" not found`
                  );
                }

                return { id: matchingOptionValue.id };
              });
            } else {
              // If the title does not contain "-", find the matching optionValue
              const matchingOptionValue = optionValues.find(
                (data) => data!.value === variant.title
              );

              if (!matchingOptionValue) {
                throw new Error(`Option value "${variant.title}" not found`);
              }

              selectedOptionValues.push({ id: matchingOptionValue.id });
            }

            return {
              title: variant.title,
              price: variant.price,
              inventory: variant.inventory,
              productId: product.id,
              selectedOptions: { connect: selectedOptionValues },
            };
          }
        );

        await Promise.all(
          variantData.map((variant: any) =>
            prisma.variant.create({ data: variant })
          )
        );

        return product;
      },
      {
        maxWait: 8000, // default: 2000
        timeout: 10000, // default: 5000
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // optional, default defined by database configuration
      }
    );

    return NextResponse.json(product);
  } catch (error: any) {
    console.log("[PRODUCTS_POST]", error);
    return new NextResponse(error.message || "Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const isFeatured = searchParams.get("isFeatured");

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
      },
      include: {
        images: true,
        category: true,
        options: {
          include: {
            values: true,
          },
        },
        variants: {
          include: {
            selectedOptions: {
              include: {
                option: true,
              },
            }, // Include selectedOptions within variants
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.log("[PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
