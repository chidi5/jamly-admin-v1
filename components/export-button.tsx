"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Upload } from "lucide-react";
import { exportBillboard, exportCategory, exportProduct } from "@/lib/queries";

type ExportProps = {
  selectedRows: any;
  type?: string;
};

const ExportButton = ({ selectedRows, type }: ExportProps) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      let filePath;
      switch (type) {
        case "billboard":
          filePath = await exportBillboard(selectedRows);

          if (filePath) {
            const link = document.createElement("a");
            link.href = filePath;
            link.download = "billboard.csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
          break;

        case "category":
          filePath = await exportCategory(selectedRows);

          if (filePath) {
            const link = document.createElement("a");
            link.href = filePath;
            link.download = "category.csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
          break;

        case "product":
          filePath = await exportProduct(selectedRows);

          if (filePath) {
            const link = document.createElement("a");
            link.href = filePath;
            link.download = "products.csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Error exporting item:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="secondary" onClick={handleExport} disabled={loading}>
      <Upload className="h-4 w-4" />
      &nbsp; {loading ? "Exporting..." : "Export CSV"}
    </Button>
  );
};

export default ExportButton;
