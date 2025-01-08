import Marquee from "react-fast-marquee";

export const NewsBar = () => (
  <div className="border-[#76E4F7] border-x-2 border-y-2">
    <div className="flex px-6 py-2">
      <div className="border-[#76E4F7] border-x-2 border-y-2 text-white px-3 py-1 font-mono">Flash News</div>
      <div className="flex-1 text-[#76E4F7] font-mono px-4 py-1 overflow-hidden whitespace-nowrap">
        <Marquee gradient={false}>
          Get ready for somenthing new - Powered by Solana | $SYDO 🐬 x $SOL
        </Marquee>
      </div>
    </div>
  </div>
);
