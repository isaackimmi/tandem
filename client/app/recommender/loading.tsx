import { RowsSkeleton } from "@/components/Feedback/RowsSkeleton";
export default function Loading() {
  return (
    <div className="m-auto max-w-[1500px] px-8 py-[38px] max-[640px]:px-4 max-[640px]:py-7">
      <div className="card rounded-2xl border border-[#ededeb] bg-white p-6 shadow-[0_7px_22px_#00000005] max-[1100px]:p-5 max-[380px]:p-4">
        <RowsSkeleton label="Opening workspace" />
      </div>
    </div>
  );
}
