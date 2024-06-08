import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";

interface CountryData {
  country: string;
  currency: string;
  language: string;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
});

export async function getCountryCodeByIP(): Promise<CountryData> {
  const GEOLOCATION_API_URL = `https://ipapi.co/json/`;

  const response = await axios.get(GEOLOCATION_API_URL);
  return {
    country: response.data.country_name,
    currency: response.data.currency || "NGN",
    language: response.data.languages.split(",")[0],
  };
}
