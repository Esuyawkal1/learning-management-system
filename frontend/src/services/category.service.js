import api from "@/services/api";
import { extractApiData, getApiErrorMessage } from "@/services/admin/helpers";

export const getCategories = async () => {
  try {
    const response = await api.get("/categories");
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch categories"));
  }
};

export const createCategory = async (payload) => {
  try {
    const response = await api.post("/categories", payload);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to create category"));
  }
};

export const updateCategory = async (categoryId, payload) => {
  try {
    const response = await api.put(`/categories/${categoryId}`, payload);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to update category"));
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const response = await api.delete(`/categories/${categoryId}`);
    return extractApiData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to delete category"));
  }
};
