"use server";

import { Store } from "@prisma/client";
import prismadb from "../prismadb";

export const getStoreById = async (id: string) => {
  try {
    const store = await prismadb.store.findUnique({
      where: { id },
    });
    return store;
  } catch (error) {
    return null;
  }
};

export const getStoreOwnerById = async (id: string) => {
  try {
    const store = await prismadb.store.findUnique({
      where: { id },
      include: {
        users: {
          where: { role: "STORE_OWNER" },
        },
      },
    });
    return store;
  } catch (error) {
    return null;
  }
};

export const updateStoreDetails = async (
  storeId: string,
  storeDetails: Partial<Store>
) => {
  try {
    const response = await prismadb.store.update({
      where: { id: storeId },
      data: { ...storeDetails },
    });
    return response;
  } catch (error) {
    console.error("Error updating store details:", error);
    throw new Error("Could not update store details");
  }
};

export const deleteStore = async (storeId: string) => {
  try {
    const response = await prismadb.store.delete({ where: { id: storeId } });
    return response;
  } catch (error) {
    console.error("Error deleting store:", error);
    throw new Error("Could not delete store");
  }
};
