import { fetchAuthSession } from "aws-amplify/auth";
import { toast } from 'react-hot-toast';

export const downloadAgreement = async (
  leaseId: number,
  propertyName?: string
) => {
  try {
    toast.loading("Preparing tenancy agreement...", {
      id: "download-agreement",
    });

    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3002";

    const response = await fetch(`${baseUrl}/leases/${leaseId}/agreement`, {
      method: "GET",
      headers: {
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Failed to download tenancy agreement."
      );
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const sanitizedName = propertyName
      ? `-${propertyName.replace(/[^a-zA-Z0-9_-]/g, "_")}`
      : "";
    link.download = `KalRent-Agreement-Lease-${leaseId}${sanitizedName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success("Tenancy agreement downloaded successfully!", {
      id: "download-agreement",
    });
  } catch (error: any) {
    console.error("Agreement download error:", error);
    toast.error(error.message || "Failed to download agreement.", {
      id: "download-agreement",
    });
  }
};
