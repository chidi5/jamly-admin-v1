import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

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

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const product = await prismadb.product.create({
      data: {
        name,
        price,
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
      const newOption = await prismadb.option.create({
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
      await prismadb.optionValue.createMany({
        data: optionData,
        skipDuplicates: true,
      });
    }

    // Create variants with option references:
    const promises = optionData.map(async (optionValue) => {
      return prismadb.optionValue.findFirst({ where: optionValue });
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
        prismadb.variant.create({ data: variant })
      )
    );

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
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
        variants: {
          include: {
            selectedOptions: true, // Include selectedOptions within variants
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
