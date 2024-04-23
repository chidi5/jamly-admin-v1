import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const product = await prismadb.product.findUnique({
      where: {
        id: params.productId,
      },
      include: {
        images: true,
        category: true,
        variants: {
          include: {
            selectedOptions: true, // Include selectedOptions within variants
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string; storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.productId) {
      return new NextResponse("Billboard id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        AND: [{ id: params.storeId }, { users: { some: { id: userId } } }],
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const product = await prismadb.product.delete({
      where: {
        id: params.productId,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { productId: string; storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await request.json();

    const {
      name,
      price,
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

    if (!categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
    }

    if (!params.productId) {
      return new NextResponse("Billboard id is required", { status: 400 });
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
    const product = await prismadb.$transaction(async (prisma) => {
      const productVariants = await prisma.variant.findMany({
        where: {
          productId: params.productId,
        },
        select: {
          selectedOptions: true,
        },
      });

      const optionIds = new Set<string>();
      productVariants.forEach((variant) => {
        variant.selectedOptions.forEach((option) => {
          optionIds.add(option.optionId);
        });
      });

      // Convert Set to array
      const optionIdsArray = Array.from(optionIds);

      for (const optionId of optionIdsArray) {
        await prisma.optionValue.deleteMany({
          where: {
            optionId,
          },
        });
      }

      await prisma.option.deleteMany({
        where: {
          id: {
            in: Array.from(optionIds),
          },
        },
      });

      const product = await prisma.product.update({
        where: {
          id: params.productId,
        },
        data: {
          name,
          price,
          categoryId,
          images: {
            deleteMany: {},
            createMany: {
              data: [...images.map((image: { url: string }) => image)],
            },
          },
          variants: {
            deleteMany: {},
          },
          isFeatured,
          isArchived,
        },
      });

      // Create options and option values
      const optionData: any[] = [];
      for (const option of options) {
        const newOption = await prisma.option.create({
          data: {
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
          // Extract potential option values from the variant title
          const splitTitle = variant.title.split("-"); // Assuming "-" is the separator

          if (splitTitle.length !== 2) {
            // Handle error: Variant title format incorrect
            throw new Error(
              `Variant title "${variant.title}" has invalid format`
            );
          }

          const optionValueData = splitTitle.map((value) => ({
            value,
          }));

          // Find matching optionValues based on name
          const selectedOptionValues = optionValueData.map((optionValue) => {
            const matchingOptionValue = optionValues.find(
              (data) => data!.value === optionValue.value
            );

            if (!matchingOptionValue) {
              throw new Error(`Option value "${optionValue.value}" not found`);
            }

            return { id: matchingOptionValue.id };
          });

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
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
