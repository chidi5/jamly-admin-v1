import { useEffect } from "react";

const GetUserLocation = ({ setLocation }: { setLocation: any }) => {
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((response) => response.json())
      .then((data) => {
        setLocation({
          country: data.country_name,
          countryCode: data.country,
          city: data.city,
          latitude: data.latitude,
          longitude: data.longitude,
          currency: data.currency || "NGN",
          language: data.languages.split(",")[0],
        });
      })
      .catch((error) => console.error("Error fetching IP geolocation:", error));
  }, [setLocation]);

  return null;
};

export default GetUserLocation;
