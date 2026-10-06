import { Suspense } from "react";
import SignInForm from "./SignInForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInSkeleton />}>
      <SignInForm />
    </Suspense>
  );
}

function SignInSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>
      </div>
    </div>
  );
}