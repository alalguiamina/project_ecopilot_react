import { useMutation } from "@tanstack/react-query";

export interface CsvDownloadRequest {
  siteId: number;
  filename?: string;
}

export const useDownloadCsvTemplate = () => {
  return useMutation({
    mutationFn: async ({
      siteId,
      filename,
    }: CsvDownloadRequest): Promise<void> => {
      console.log("🚀 useDownloadCsvTemplate mutationFn called with:", {
        siteId,
        filename,
      });

      // ✅ Validate inputs
      if (!siteId || isNaN(siteId)) {
        throw new Error("Invalid site ID provided");
      }

      const API_BASE_URL =
        process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

      // ✅ Get access token for authentication
      const tokenKeys = [
        "authToken",
        "ACCESS_TOKEN",
        "access_token",
        "token",
        "accessToken",
      ];

      let token: string | null = null;
      for (const key of tokenKeys) {
        const foundToken = localStorage.getItem(key);
        if (foundToken) {
          token = foundToken;
          break;
        }
      }

      if (!token) {
        throw new Error(
          "Aucun token d'authentification trouvé. Veuillez vous reconnecter.",
        );
      }

      console.log("📤 Downloading CSV template for site:", siteId);

      const url = `${API_BASE_URL}/core/saisies-csv/${siteId}/download_csv/`;

      try {
        // ✅ Make the download request
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,*/*",
          },
          credentials: "include",
        });

        console.log("📥 Download response:", {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get("content-type"),
          contentDisposition: response.headers.get("content-disposition"),
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Non autorisé. Veuillez vous reconnecter.");
          } else if (response.status === 404) {
            throw new Error(
              `Site avec l'ID ${siteId} non trouvé ou template non disponible.`,
            );
          } else if (response.status === 500) {
            throw new Error(
              "Erreur interne du serveur. Veuillez réessayer plus tard.",
            );
          } else {
            throw new Error(
              `Erreur lors du téléchargement: ${response.status} ${response.statusText}`,
            );
          }
        }

        // ✅ Get the blob data
        const blob = await response.blob();

        if (blob.size === 0) {
          throw new Error("Le fichier téléchargé est vide.");
        }

        // ✅ Extract filename from Content-Disposition header or use default
        let downloadFilename =
          filename || `template_saisie_site_${siteId}.xlsx`;

        const contentDisposition = response.headers.get("content-disposition");
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(
            /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
          );
          if (filenameMatch && filenameMatch[1]) {
            downloadFilename = filenameMatch[1].replace(/['"]/g, "");
          }
        }

        // ✅ Create download link and trigger download
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = downloadFilename;
        document.body.appendChild(link);
        link.click();

        // ✅ Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        console.log(
          `✅ CSV template downloaded successfully: ${downloadFilename}`,
        );
      } catch (error) {
        console.error("❌ CSV template download failed:", error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      console.log(
        "🎉 CSV template download completed successfully for site:",
        variables.siteId,
      );
    },
    onError: (error, variables) => {
      console.error(
        "❌ CSV template download failed for site:",
        variables.siteId,
        error,
      );
    },
  });
};

export default useDownloadCsvTemplate;
