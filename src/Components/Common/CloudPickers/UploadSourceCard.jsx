import { cn } from "@/lib/utils";

export const uploadSourceCardClassName =
  "group flex min-h-[4.5rem] w-full cursor-pointer items-center justify-center gap-4 rounded-md border border-border bg-secondary px-4 py-3 text-foreground transition-colors hover:border-primary hover:bg-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const UploadSourceCard = ({ className, ...props }) => <div {...props} className={cn(uploadSourceCardClassName, className)} />;

export default UploadSourceCard;
