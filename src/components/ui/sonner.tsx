import { Toaster as Sonner, toast as sonnerToast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

// Enforce single-active-toast policy by dismissing any active notification immediately
// before rendering a new one, avoiding stacked notification cards on mobile.
const dismissPreviousToasts = () => {
  try {
    sonnerToast.dismiss();
  } catch {
    // sonner instance might not be mounted yet
  }
};

// Intercept toast methods on the shared sonner instance to ensure single active toast
const originalSuccess = sonnerToast.success.bind(sonnerToast);
sonnerToast.success = ((...args: Parameters<typeof originalSuccess>) => {
  dismissPreviousToasts();
  const [message, data] = args;
  return originalSuccess(message, { duration: 3000, ...data });
}) as typeof originalSuccess;

const originalInfo = sonnerToast.info.bind(sonnerToast);
sonnerToast.info = ((...args: Parameters<typeof originalInfo>) => {
  dismissPreviousToasts();
  const [message, data] = args;
  return originalInfo(message, { duration: 3000, ...data });
}) as typeof originalInfo;

const originalWarning = sonnerToast.warning.bind(sonnerToast);
sonnerToast.warning = ((...args: Parameters<typeof originalWarning>) => {
  dismissPreviousToasts();
  const [message, data] = args;
  return originalWarning(message, { duration: 3000, ...data });
}) as typeof originalWarning;

const originalError = sonnerToast.error.bind(sonnerToast);
sonnerToast.error = ((...args: Parameters<typeof originalError>) => {
  dismissPreviousToasts();
  const [message, data] = args;
  return originalError(message, { duration: 3000, ...data });
}) as typeof originalError;

const originalMessage = sonnerToast.message.bind(sonnerToast);
sonnerToast.message = ((...args: Parameters<typeof originalMessage>) => {
  dismissPreviousToasts();
  const [message, data] = args;
  return originalMessage(message, { duration: 3000, ...data });
}) as typeof originalMessage;

const originalCustom = sonnerToast.custom.bind(sonnerToast);
sonnerToast.custom = ((...args: Parameters<typeof originalCustom>) => {
  dismissPreviousToasts();
  const [jsx, data] = args;
  return originalCustom(jsx, { duration: 3000, ...data });
}) as typeof originalCustom;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-center"
      visibleToasts={1}
      duration={3000}
      swipeDirections={["top", "right", "left"]}
      closeButton
      className="toaster group"
      toastOptions={{
        duration: 3000,
        style: {
          maxWidth: "90vw",
        },
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg max-w-[90vw] sm:max-w-md mx-auto w-full text-xs sm:text-sm",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export { Toaster, sonnerToast as toast };
