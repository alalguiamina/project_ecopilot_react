import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchClient } from "../API/fetchClient";
import type { CsvUploadResponse, CsvUploadRequest } from "../types/saisie";

export const useUploadCsvSaisie = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      siteId,
      file,
    }: CsvUploadRequest): Promise<CsvUploadResponse> => {
      console.log("🚀 useUploadCsvSaisie mutationFn called with:", {
        siteId,
        fileName: file.name,
        fileSize: file.size,
      });

      // ✅ Validate inputs
      if (!siteId || isNaN(siteId)) {
        throw new Error("Invalid site ID provided");
      }

      if (!file) {
        throw new Error("No file provided");
      }

      // ✅ Validate file type
      const allowedTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      const allowedExtensions = [".csv", ".xls", ".xlsx"];
      const fileExtension = file.name
        .toLowerCase()
        .substring(file.name.lastIndexOf("."));

      if (
        !allowedTypes.includes(file.type) &&
        !allowedExtensions.includes(fileExtension)
      ) {
        throw new Error(
          "Type de fichier non supporté. Veuillez utiliser un fichier CSV, XLS ou XLSX.",
        );
      }

      // ✅ Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error(
          "Le fichier est trop volumineux. Taille maximale autorisée : 10MB.",
        );
      }

      console.log("🌐 Preparing CSV upload request for site:", siteId);

      // ✅ Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);

      console.log("📤 Uploading CSV file:", {
        endpoint: `/core/saisies-csv/${siteId}/upload_csv/`,
        fileName: file.name,
        fileType: file.type,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      });

      // ✅ Make the API call
      const response = await fetchClient<CsvUploadResponse>(
        `/core/saisies-csv/${siteId}/upload_csv/`,
        {
          method: "POST",
          body: formData,
          // Don't set Content-Type header - let the browser set it with boundary for FormData
          headers: {},
        },
      );

      console.log("📥 Upload response:", {
        status: response.status,
        hasError: !!response.error,
        hasData: !!response.data,
        error: response.error,
        data: response.data,
      });

      if (response.error) {
        console.error("❌ CSV upload failed:", response.error);

        // Handle different error types
        if (response.status === 400) {
          const errorMsg =
            response.error?.detail ||
            response.error?.message ||
            JSON.stringify(response.error) ||
            "Données du fichier invalides";
          throw new Error(errorMsg);
        } else if (response.status === 413) {
          throw new Error("Le fichier est trop volumineux");
        } else if (response.status === 415) {
          throw new Error("Type de fichier non supporté");
        } else if (response.status === 404) {
          throw new Error(`Site avec l'ID ${siteId} non trouvé`);
        } else if (response.status === 500) {
          throw new Error(
            "Erreur interne du serveur. Veuillez réessayer plus tard.",
          );
        } else {
          const errorMsg =
            response.error?.detail ||
            response.error?.message ||
            JSON.stringify(response.error) ||
            `Erreur HTTP ${response.status}`;
          throw new Error(errorMsg);
        }
      }

      console.log("✅ CSV upload successful:", response.data);
      return response.data!;
    },
    onSuccess: (data, variables) => {
      console.log(
        "🎉 CSV upload completed successfully for site:",
        variables.siteId,
      );

      // ✅ Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["saisies", variables.siteId],
      });
      queryClient.invalidateQueries({
        queryKey: ["saisies"],
      });

      // Log upload results
      if (data.created_saisies) {
        console.log(`📊 Created ${data.created_saisies} new saisies`);
      }
      if (data.updated_saisies) {
        console.log(`📝 Updated ${data.updated_saisies} existing saisies`);
      }
      if (data.errors?.length) {
        console.warn(
          `⚠️ ${data.errors.length} errors encountered during upload`,
        );
      }
      if (data.warnings?.length) {
        console.warn(
          `⚠️ ${data.warnings.length} warnings encountered during upload`,
        );
      }
    },
    onError: (error, variables) => {
      console.error("❌ CSV upload failed for site:", variables.siteId, error);
    },
  });
};

export default useUploadCsvSaisie;
