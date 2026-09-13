interface PaystackCheckoutOptions {
  key: string;
  email: string;
  amount: number; // in kobo (NGN * 100)
  reference: string;
  onSuccess?: (response: any) => void;
  onClose?: () => void;
}

export const loadPaystackScript = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Paystack only runs in browser"));
      return;
    }
    if ((window as any).PaystackPop) {
      resolve((window as any).PaystackPop);
      return;
    }
    const existingScript = document.getElementById("paystack-inline-js");
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        resolve((window as any).PaystackPop);
      });
      return;
    }
    const script = document.createElement("script");
    script.id = "paystack-inline-js";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => {
      resolve((window as any).PaystackPop);
    };
    script.onerror = () => {
      reject(new Error("Failed to load Paystack inline JS"));
    };
    document.body.appendChild(script);
  });
};

export const openPaystackPopup = async (options: PaystackCheckoutOptions) => {
  const PaystackPop = await loadPaystackScript();
  const handler = PaystackPop.setup({
    key: options.key,
    email: options.email,
    amount: options.amount,
    ref: options.reference,
    callback: (response: any) => {
      if (options.onSuccess) options.onSuccess(response);
    },
    onClose: () => {
      if (options.onClose) options.onClose();
    },
  });
  handler.openIframe();
};
