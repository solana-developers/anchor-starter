import CounterState from "@/components/counter-state";
import IncrementButton from "@/components/increment-button";
import SolanaPay from "@/components/solana-pay";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <CounterState />
      <IncrementButton />
      <SolanaPay />
    </div>
  );
}
