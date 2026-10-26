import React from "react";
import { useTranslation } from "react-i18next";
import { Carousel } from "@/Components/UI/shadcnCompat";
import {
  Activity,
  Check,
  CheckCircle,
  Cloud,
  FileText,
  Folder,
  Key,
  Lock,
  Mail,
  PenTool,
  Shield,
  User,
} from "lucide-react";
import { useTheme } from "@/Context/ThemeContext";

const loginSlides = [
  {
    title: "carousel.uploadDoc",
    subtitle: "carousel.pdfImage",
    descriptions: ["carousel.uplaodImpDocs", "carousel.getStartedPath"],
    scene: "upload",
  },
  {
    title: "carousel.specifyPart",
    subtitle: "carousel.addSignatoryorSign",
    descriptions: ["carousel.easilySpecify", "carousel.PlatformEmpowers"],
    scene: "participants",
  },
  {
    title: "carousel.sendSign",
    subtitle: "carousel.shareSignedDocs",
    descriptions: ["carousel.electronicallySigning", "carousel.timelyCollaboration"],
    scene: "send",
  },
];

const signupSlides = [
  {
    title: "carousel.fillData",
    subtitle: "carousel.joinImSigner",
    descriptions: ["carousel.experienceDigitally"],
    scene: "account",
  },
  {
    title: "carousel.uploadDoc",
    subtitle: "carousel.pdfImage",
    descriptions: ["carousel.uplaodImpDocs", "carousel.getStartedPath"],
    scene: "library",
  },
  {
    title: "carousel.sendSign",
    subtitle: "carousel.shareSignedDocs",
    descriptions: ["carousel.electronicallySigning", "carousel.timelyCollaboration"],
    scene: "ready",
  },
];

const recoverySlides = [
  {
    title: "carousel.passRecovery",
    subtitle: "carousel.featureEnsure",
    descriptions: ["carousel.experinceconvenience"],
    scene: "recovery",
  },
];

const floatingCardStyle = {
  background: "color-mix(in srgb, var(--modern-card) 88%, rgba(255, 255, 255, 0.08))",
};

const linePrimaryStyle = {
  background: "color-mix(in srgb, var(--modern-text) 30%, var(--modern-card))",
};

const lineMutedStyle = {
  background: "color-mix(in srgb, var(--modern-text) 20%, var(--modern-card))",
};

const SparkOne = () => (
  <span className=' absolute z-[3] top-[27%] start-[10%] h-[9px] w-[9px] rounded-full border-2 border-solid border-[var(--modern-cyan)] opacity-80' />
);

const SparkTwo = () => (
  <span className='absolute z-[3] bottom-[22%] end-[12%] h-[6px] w-[6px] rounded-full border-2 border-solid border-[var(--modern-pink)] opacity-80' />
);

const ArtworkShell = ({ children, background }) => (
  <div
    aria-hidden='true'
    className='relative isolate w-full h-[215px] md:h-[250px] lg:h-[275px] xl:h-[300px] overflow-hidden rounded-[23px] md:rounded-[26px] lg:rounded-[32px] border border-solid border-[var(--modern-border-strong)] shadow-[var(--modern-card-shadow)]'
    style={{
      background:
        background ||
        "radial-gradient(ellipse at 50% 90%, var(--modern-glow-violet), transparent 56%), linear-gradient(145deg, color-mix(in srgb, var(--modern-card) 78%, var(--modern-violet-soft)), var(--modern-surface))",
    }}
  >
    <span
      className='pointer-events-none absolute inset-0 -z-10 opacity-20'
      style={{
        backgroundImage: "radial-gradient(var(--modern-violet) 0.8px, transparent 0.8px)",
        backgroundSize: "21px 21px",
        maskImage: "linear-gradient(135deg, #000 0%, transparent 58%)",
      }}
    />
    <span
      className='pointer-events-none absolute inset-[18px] -z-10 rounded-[24px] border border-solid'
      style={{
        borderColor: "color-mix(in srgb, var(--modern-violet) 14%, transparent)",
      }}
    />
    {children}
  </div>
);

const UploadArtwork = () => (
  <ArtworkShell
    background='radial-gradient(ellipse at 74% 27%, color-mix(in srgb, var(--modern-cyan) 18%, transparent), transparent 38%), linear-gradient(145deg, color-mix(in srgb, var(--modern-blue) 8%, var(--modern-card)), var(--modern-surface))'
  >
    <div
      className='absolute top-[84px] start-[13%] flex h-[104px] w-[82px] -rotate-12 items-start justify-center gap-2 rounded-[13px] border border-solid border-[var(--modern-border-strong)] p-3.5 text-[19px] text-[var(--modern-violet)] opacity-65 shadow-md'
      style={floatingCardStyle}
    />
    <div
      className='absolute bottom-[38px] start-[18%] flex h-[104px] w-[82px] -rotate-3 items-start justify-center gap-2 rounded-[13px] border border-solid border-[var(--modern-border-strong)] p-3.5 text-[19px] text-[var(--modern-violet)] shadow-md'
      style={floatingCardStyle}
    >
      <FileText />
      <span className='flex w-[34px] flex-col gap-1.5 pt-1'>
        <i className='block h-1 rounded-full' style={linePrimaryStyle} />
        <i className='block h-1 rounded-full' style={lineMutedStyle} />
      </span>
    </div>
    <div
      className='absolute top-[38px] bottom-[35px] start-[25%] end-[17%] flex flex-col items-center justify-center rounded-[25px] border border-dashed shadow-md'
      style={{
        ...floatingCardStyle,
        borderColor: "color-mix(in srgb, var(--modern-violet) 45%, transparent)",
      }}
    >
      <span
        className='mb-4 grid h-[66px] w-[66px] place-items-center rounded-[20px] border border-solid text-[29px] text-[var(--modern-violet)]'
        style={{
          borderColor: "color-mix(in srgb, var(--modern-violet) 22%, transparent)",
          background: "linear-gradient(140deg, var(--modern-violet-soft), color-mix(in srgb, var(--modern-cyan) 10%, var(--modern-card)))",
          boxShadow: "0 8px 22px var(--modern-glow-violet)",
        }}
      >
        <Cloud />
      </span>
      <span className='mb-2 h-1.5 w-[112px] rounded-full' style={linePrimaryStyle} />
      <span className='mb-4 h-1.5 w-[71px] rounded-full' style={lineMutedStyle} />
      <span className='h-[5px] w-[125px] overflow-hidden rounded-full bg-[var(--modern-violet-soft)]'>
        <i
          className='block h-full w-[68%] rounded-full'
          style={{ background: "linear-gradient(90deg, var(--modern-violet), var(--modern-cyan))" }}
        />
      </span>
    </div>
    <div
      className='absolute top-[48px] end-[8%] flex rotate-3 items-center gap-2 rounded-[14px] border border-solid border-[var(--modern-border-strong)] px-3 py-2.5 text-[19px] text-[var(--modern-cyan)] shadow-md'
      style={floatingCardStyle}
    >
      <CheckCircle />
      <span className='flex w-[50px] flex-col gap-1'>
        <i className='block h-[5px] rounded-full' style={linePrimaryStyle} />
        <i className='block h-1 w-[68%] rounded-full' style={lineMutedStyle} />
      </span>
    </div>
    <SparkOne />
    <SparkTwo />
  </ArtworkShell>
);

const ParticipantBadge = ({ letter, className, icon: Icon }) => (
  <div
    className={`absolute flex min-w-[104px] md:min-w-[130px] items-center gap-1.5 md:gap-2 rounded-[13px] border border-solid border-[var(--modern-border-strong)] p-1.5 md:p-2 text-xs shadow-md ${className}`}
    style={floatingCardStyle}
  >
    <span
      className='grid h-[25px] w-[25px] md:h-[31px] md:w-[31px] flex-none place-items-center rounded-[11px] text-[11px] font-bold text-white'
      style={{ background: "linear-gradient(145deg, var(--modern-violet), var(--modern-blue))" }}
    >
      {letter}
    </span>
    <span className='flex w-[28px] md:w-[44px] flex-col gap-1'>
      <i className='block h-1 w-[88%] rounded-full' style={linePrimaryStyle} />
      <i className='block h-1 rounded-full' style={lineMutedStyle} />
    </span>
    <Icon />
  </div>
);

const ParticipantsArtwork = () => (
  <ArtworkShell
    background='radial-gradient(ellipse at 50% 48%, color-mix(in srgb, var(--modern-violet) 11%, transparent), transparent 57%), linear-gradient(145deg, var(--modern-surface), color-mix(in srgb, var(--modern-cyan) 7%, var(--modern-card)))'
  >
    <svg className='absolute inset-0 h-full w-full overflow-visible' viewBox='0 0 560 300' preserveAspectRatio='none'>
      <path
        d='M114 80 C165 80 176 133 224 143'
        fill='none'
        stroke='color-mix(in srgb, var(--modern-violet) 36%, transparent)'
        strokeDasharray='4 7'
        strokeWidth='1.5'
      />
      <path
        d='M445 67 C397 69 380 124 337 139'
        fill='none'
        stroke='color-mix(in srgb, var(--modern-violet) 36%, transparent)'
        strokeDasharray='4 7'
        strokeWidth='1.5'
      />
      <path
        d='M126 230 C171 218 181 183 224 167'
        fill='none'
        stroke='color-mix(in srgb, var(--modern-violet) 36%, transparent)'
        strokeDasharray='4 7'
        strokeWidth='1.5'
      />
      <path
        d='M433 227 C386 218 376 185 337 166'
        fill='none'
        stroke='color-mix(in srgb, var(--modern-violet) 36%, transparent)'
        strokeDasharray='4 7'
        strokeWidth='1.5'
      />
    </svg>
    <div
      className='absolute top-[42px] bottom-[38px] left-1/2 w-[31%] min-w-[126px] md:min-w-[142px] -translate-x-1/2 -rotate-2 rounded-[14px] border border-solid border-[var(--modern-border-strong)] px-3 py-4 shadow-md'
      style={floatingCardStyle}
    >
      <div className='flex items-center gap-2 text-[16px] text-[var(--modern-violet)]'>
        <FileText />
        <span className='flex w-[68%] flex-col gap-1'>
          <i className='block h-[5px] w-[85%] rounded-full' style={linePrimaryStyle} />
          <i className='block h-1 w-[55%] rounded-full' style={lineMutedStyle} />
        </span>
      </div>
      <div className='my-5 flex flex-col gap-2'>
        <i className='block h-[5px] rounded-full' style={lineMutedStyle} />
        <i className='block h-[5px] w-[76%] rounded-full' style={lineMutedStyle} />
        <i className='block h-[5px] rounded-full' style={lineMutedStyle} />
        <i className='block h-[5px] w-[76%] rounded-full' style={lineMutedStyle} />
        <i className='block h-[5px] rounded-full' style={lineMutedStyle} />
      </div>
      <div className='flex items-center gap-2 rounded-lg border border-solid border-[var(--modern-border)] bg-[var(--modern-violet-soft)] p-2 text-[var(--modern-violet)]'>
        <PenTool />
        <span
          className='h-1 w-[60%] rounded-full'
          style={{ background: "color-mix(in srgb, var(--modern-violet) 35%, var(--modern-card))" }}
        />
      </div>
    </div>
    <ParticipantBadge letter='A' className='top-[32px] start-[4%] text-[var(--modern-cyan)]' icon={Check} />
    <ParticipantBadge letter='M' className='top-[34px] end-[4%] text-[var(--modern-violet)]' icon={PenTool} />
    <ParticipantBadge letter='J' className='bottom-[31px] start-[4%] text-[var(--modern-cyan)]' icon={Check} />
    <ParticipantBadge letter='S' className='bottom-[30px] end-[4%] text-[var(--modern-violet)]' icon={Check} />
    <SparkOne />
    <SparkTwo />
  </ArtworkShell>
);

const SendArtwork = () => (
  <ArtworkShell
    background='radial-gradient(ellipse at 50% 88%, color-mix(in srgb, var(--modern-pink) 12%, transparent), transparent 56%), linear-gradient(145deg, color-mix(in srgb, var(--modern-violet) 7%, var(--modern-card)), var(--modern-surface))'
  >
    <div
      className='absolute top-[34px] left-1/2 flex h-[165px] w-[188px] -translate-x-1/2 rotate-3 flex-col gap-3 rounded-[15px] border border-solid border-[var(--modern-border-strong)] p-4 shadow-md'
      style={floatingCardStyle}
    >
      <span className='grid h-[33px] w-[33px] place-items-center rounded-[10px] bg-[var(--modern-violet-soft)] text-[17px] text-[var(--modern-violet)]'>
        <FileText />
      </span>
      <span className='flex flex-col gap-1.5'>
        <i className='block h-[5px] rounded-full' style={lineMutedStyle} />
        <i className='block h-[5px] w-[72%] rounded-full' style={lineMutedStyle} />
        <i className='block h-[5px] rounded-full' style={lineMutedStyle} />
      </span>
      <span className='absolute bottom-[18px] end-[17px] grid h-[29px] w-[47px] place-items-center border-b border-solid border-[var(--modern-cyan)] text-[var(--modern-cyan)]'>
        <PenTool />
      </span>
    </div>
    <div
      className='absolute bottom-[35px] start-[25%] h-[112px] w-[230px] -rotate-6 overflow-hidden rounded-[17px] border border-solid'
      style={{
        borderColor: "color-mix(in srgb, var(--modern-violet) 27%, transparent)",
        background: "linear-gradient(135deg, var(--modern-violet), var(--modern-blue) 62%, var(--modern-cyan))",
        boxShadow: "0 16px 36px var(--modern-glow-violet)",
      }}
    >
      <span
        className='absolute inset-0 block'
        style={{
          background:
            "linear-gradient(145deg, transparent 49.4%, rgba(255, 255, 255, 0.45) 50%, transparent 50.7%), linear-gradient(35deg, transparent 49.4%, rgba(255, 255, 255, 0.34) 50%, transparent 50.7%)",
        }}
      />
    </div>
    <div className='absolute top-[54%] end-[19%] flex -rotate-12 items-center gap-1.5'>
      <i className='h-[5px] w-[5px] rounded-full bg-[var(--modern-cyan)]' />
      <i
        className='h-[1px] w-[48px]'
        style={{ background: "color-mix(in srgb, var(--modern-violet) 50%, transparent)" }}
      />
      <i className='h-[5px] w-[5px] rounded-full bg-[var(--modern-cyan)]' />
    </div>
    <div
      className='absolute top-[48px] end-[7%] flex rotate-3 items-center gap-2 rounded-[14px] border border-solid border-[var(--modern-border-strong)] px-3 py-2 shadow-md'
      style={floatingCardStyle}
    >
      <span
        className='grid h-[28px] w-[28px] place-items-center rounded-[9px] text-[var(--modern-cyan)]'
        style={{ background: "color-mix(in srgb, var(--modern-cyan) 13%, var(--modern-card))" }}
      >
        <Check />
      </span>
      <span className='flex w-[51px] flex-col gap-1'>
        <i className='block h-[5px] w-[90%] rounded-full' style={linePrimaryStyle} />
        <i className='block h-1 w-[62%] rounded-full' style={lineMutedStyle} />
      </span>
    </div>
    <div
      className='absolute bottom-[46px] start-[11%] grid h-[46px] w-[46px] -rotate-6 place-items-center rounded-[15px] border border-solid border-[var(--modern-border-strong)] text-[21px] text-[var(--modern-violet)] shadow-md'
      style={floatingCardStyle}
    >
      <Mail />
    </div>
    <SparkOne />
    <SparkTwo />
  </ArtworkShell>
);

const AccountArtwork = () => (
  <ArtworkShell
    background='radial-gradient(ellipse at 50% 49%, color-mix(in srgb, var(--modern-cyan) 14%, transparent), transparent 53%), linear-gradient(145deg, color-mix(in srgb, var(--modern-blue) 8%, var(--modern-card)), var(--modern-surface))'
  >
    <span
      className='absolute top-1/2 left-1/2 h-[195px] w-[310px] -translate-x-1/2 -translate-y-1/2 -rotate-[27deg] rounded-full border border-solid'
      style={{ borderColor: "color-mix(in srgb, var(--modern-violet) 20%, transparent)" }}
    />
    <span
      className='absolute top-1/2 left-1/2 h-[220px] w-[355px] -translate-x-1/2 -translate-y-1/2 rotate-[25deg] rounded-full border border-solid'
      style={{ borderColor: "color-mix(in srgb, var(--modern-cyan) 20%, transparent)" }}
    />
    <div
      className='absolute top-[28px] bottom-[23px] left-1/2 flex w-[min(230px,48%)] -translate-x-1/2 -rotate-2 flex-col items-center gap-2.5 rounded-[21px] border border-solid border-[var(--modern-border-strong)] px-4 py-4 shadow-md'
      style={floatingCardStyle}
    >
      <div
        className='grid h-[48px] w-[48px] place-items-center rounded-[17px] border-4 border-solid text-[21px] text-white'
        style={{
          borderColor: "color-mix(in srgb, var(--modern-blue) 19%, var(--modern-card))",
          background: "linear-gradient(135deg, var(--modern-violet), var(--modern-blue))",
        }}
      >
        <User />
      </div>
      <span className='flex w-[79%] flex-col items-center gap-1.5'>
        <i className='block h-1.5 w-[78%] rounded-full' style={linePrimaryStyle} />
        <i className='block h-1 w-[51%] rounded-full' style={lineMutedStyle} />
      </span>
      <div
        className='flex h-[34px] w-full items-center gap-2 rounded-[9px] border border-solid border-[var(--modern-border)] px-2.5 text-[13px] text-[var(--modern-muted)]'
        style={{ background: "color-mix(in srgb, var(--modern-raised) 48%, var(--modern-card))" }}
      >
        <Mail />
        <span className='h-1 w-[68%] rounded-full' style={lineMutedStyle} />
      </div>
      <div
        className='flex h-[34px] w-full items-center gap-2 rounded-[9px] border border-solid border-[var(--modern-border)] px-2.5 text-[13px] text-[var(--modern-muted)]'
        style={{ background: "color-mix(in srgb, var(--modern-raised) 48%, var(--modern-card))" }}
      >
        <Lock />
        <span className='h-1 w-[68%] rounded-full' style={lineMutedStyle} />
      </div>
      <div
        className='flex h-[30px] w-full items-center justify-center gap-2 rounded-[9px] text-xs text-white'
        style={{ background: "linear-gradient(105deg, var(--modern-violet), var(--modern-blue))" }}
      >
        <Check />
        <span className='h-1 w-[57px] rounded-full bg-white/75' />
      </div>
    </div>
    <div
      className='absolute top-[46px] end-[16%] grid h-[48px] w-[48px] rotate-6 place-items-center rounded-[16px] border border-solid border-[var(--modern-border-strong)] text-[22px] text-[var(--modern-cyan)] shadow-md'
      style={floatingCardStyle}
    >
      <Shield />
    </div>
    <SparkOne />
  </ArtworkShell>
);

const LibraryFolderTile = ({ icon: Icon, colorVar }) => (
  <div
    className='grid grid-cols-[27px_1fr] md:grid-cols-[35px_1fr] grid-rows-2 items-center gap-x-2 rounded-xl border border-solid border-[var(--modern-border)] p-2 md:p-2.5'
    style={{ background: "color-mix(in srgb, var(--modern-raised) 37%, var(--modern-card))" }}
  >
    <span
      className='row-span-2 grid h-[27px] w-[27px] md:h-[34px] md:w-[34px] place-items-center rounded-[10px]'
      style={{
        background: `color-mix(in srgb, var(${colorVar}) 14%, var(--modern-card))`,
        color: `var(${colorVar})`,
      }}
    >
      <Icon size={16} />
    </span>
    <i className='block h-1 w-[90%] rounded-full' style={linePrimaryStyle} />
    <i className='block h-1 w-[58%] rounded-full' style={lineMutedStyle} />
  </div>
);

const LibraryArtwork = () => (
  <ArtworkShell
    background='radial-gradient(ellipse at 32% 74%, color-mix(in srgb, var(--modern-violet) 14%, transparent), transparent 45%), linear-gradient(145deg, var(--modern-surface), color-mix(in srgb, var(--modern-blue) 8%, var(--modern-card)))'
  >
    <div
      className='absolute top-[33px] bottom-[31px] inset-x-[13%] rotate-1 overflow-hidden rounded-[18px] border border-solid border-[var(--modern-border-strong)] shadow-md'
      style={floatingCardStyle}
    >
      <div
        className='flex h-8 items-center gap-1.5 border-b border-solid border-[var(--modern-border)] px-3'
        style={{ background: "color-mix(in srgb, var(--modern-raised) 67%, var(--modern-card))" }}
      >
        <span className='h-1.5 w-1.5 rounded-full bg-[var(--modern-pink)]' />
        <span className='h-1.5 w-1.5 rounded-full bg-[var(--modern-blue)]' />
        <span className='h-1.5 w-1.5 rounded-full bg-[var(--modern-border-strong)]' />
      </div>
      <div className='grid h-[calc(100%-32px)] grid-cols-2 gap-2 md:gap-3 p-3 md:p-5'>
        <LibraryFolderTile icon={Folder} colorVar='--modern-violet' />
        <LibraryFolderTile icon={FileText} colorVar='--modern-blue' />
        <LibraryFolderTile icon={Folder} colorVar='--modern-cyan' />
        <LibraryFolderTile icon={FileText} colorVar='--modern-pink' />
      </div>
    </div>
    <div
      className='absolute bottom-[47px] end-[8%] flex -rotate-3 items-center gap-2 rounded-[13px] border border-solid border-[var(--modern-border-strong)] p-2.5 text-[var(--modern-violet)] shadow-md'
      style={floatingCardStyle}
    >
      <Activity />
      <span className='flex w-[41px] flex-col gap-1'>
        <i className='block h-[5px] w-[90%] rounded-full' style={linePrimaryStyle} />
        <i className='block h-1 rounded-full' style={lineMutedStyle} />
      </span>
      <b className='grid h-5 w-5 place-items-center rounded-[7px] bg-[var(--modern-violet-soft)] text-[13px] text-[var(--modern-violet)]'>
        +
      </b>
    </div>
    <div
      className='absolute top-[52px] start-[7%] grid h-[42px] w-[42px] -rotate-6 place-items-center rounded-[14px] border border-solid border-[var(--modern-border-strong)] text-[19px] text-[var(--modern-cyan)] shadow-md'
      style={floatingCardStyle}
    >
      <CheckCircle />
    </div>
    <SparkTwo />
  </ArtworkShell>
);

const ReadyArtwork = () => (
  <ArtworkShell
    background='radial-gradient(ellipse at 50% 54%, color-mix(in srgb, var(--modern-cyan) 17%, transparent), transparent 50%), linear-gradient(145deg, color-mix(in srgb, var(--modern-pink) 7%, var(--modern-card)), var(--modern-surface))'
  >
    <div
      className='absolute top-[24px] bottom-[21px] left-1/2 flex w-[195px] -translate-x-1/2 -rotate-3 flex-col items-center gap-3 rounded-[18px] border border-solid border-[var(--modern-border-strong)] p-4 shadow-md'
      style={floatingCardStyle}
    >
      <span
        className='grid h-[48px] w-[48px] place-items-center rounded-full border border-solid text-[22px] text-[var(--modern-cyan)]'
        style={{
          borderColor: "color-mix(in srgb, var(--modern-cyan) 30%, transparent)",
          background: "color-mix(in srgb, var(--modern-cyan) 12%, var(--modern-card))",
        }}
      >
        <Check />
      </span>
      <span className='flex w-[76%] flex-col items-center gap-1.5'>
        <i className='block h-1.5 w-full rounded-full' style={linePrimaryStyle} />
        <i className='block h-1 w-[58%] rounded-full' style={lineMutedStyle} />
      </span>
      <span className='flex w-full flex-col gap-1.5 py-1'>
        <i className='block h-1 w-full rounded-full' style={lineMutedStyle} />
        <i className='block h-1 w-[83%] rounded-full' style={lineMutedStyle} />
        <i className='block h-1 w-[61%] rounded-full' style={lineMutedStyle} />
      </span>
      <span className='grid h-[27px] w-[71px] self-end place-items-center border-b border-solid border-[var(--modern-violet)] text-[17px] text-[var(--modern-violet)]'>
        <PenTool />
      </span>
    </div>
    <div className='absolute top-[43px] start-[23%] text-[23px] text-[var(--modern-cyan)]'>✦</div>
    <div className='absolute bottom-[53px] end-[23%] text-[28px] text-[var(--modern-pink)]'>✦</div>
    <div className='absolute top-[86px] end-[20%] text-[32px] text-[var(--modern-blue)]'>✧</div>
    <div
      className='absolute bottom-[34px] start-[19%] grid h-[41px] w-[41px] rotate-6 place-items-center rounded-[14px] border border-solid border-[var(--modern-border-strong)] text-[20px] text-[var(--modern-violet)] shadow-md'
      style={floatingCardStyle}
    >
      <CheckCircle />
    </div>
  </ArtworkShell>
);

const RecoveryArtwork = () => (
  <ArtworkShell
    background='radial-gradient(ellipse at 50% 48%, color-mix(in srgb, var(--modern-blue) 16%, transparent), transparent 51%), linear-gradient(145deg, color-mix(in srgb, var(--modern-violet) 10%, var(--modern-card)), var(--modern-surface))'
  >
    <span
      className='absolute top-1/2 left-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-solid'
      style={{ borderColor: "color-mix(in srgb, var(--modern-violet) 24%, transparent)" }}
    />
    <span
      className='absolute top-1/2 left-1/2 h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed'
      style={{ borderColor: "color-mix(in srgb, var(--modern-cyan) 35%, transparent)" }}
    />
    <span
      className='absolute top-1/2 left-1/2 h-[140px] w-[140px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-solid'
      style={{ borderColor: "color-mix(in srgb, var(--modern-blue) 32%, transparent)" }}
    />
    <div
      className='absolute top-1/2 left-1/2 grid h-[140px] w-[124px] -translate-x-1/2 -translate-y-1/2 place-items-center border border-solid text-[var(--modern-violet)]'
      style={{
        borderRadius: "44% 44% 48% 48% / 30% 30% 65% 65%",
        borderColor: "color-mix(in srgb, var(--modern-violet) 42%, var(--modern-border-strong))",
        background:
          "linear-gradient(145deg, color-mix(in srgb, var(--modern-violet) 22%, var(--modern-card)), color-mix(in srgb, var(--modern-card) 88%, rgba(255, 255, 255, 0.08)))",
        boxShadow: "0 18px 45px var(--modern-glow-violet), inset 0 0 24px var(--modern-glow-violet)",
      }}
    >
      <Shield className='block h-[84px] w-[84px]' style={{ strokeWidth: 1.5 }} />
      <span
        className='absolute top-[47%] left-1/2 grid h-[32px] w-[32px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[10px] border border-solid border-[var(--modern-border-strong)] text-[16px] text-[var(--modern-cyan)] shadow-sm'
        style={floatingCardStyle}
      >
        <Lock />
      </span>
    </div>
    <div
      className='absolute top-[61px] end-[24%] grid h-[48px] w-[48px] rotate-12 place-items-center rounded-[16px] border border-solid border-[var(--modern-border-strong)] text-[20px] text-[var(--modern-blue)] shadow-md'
      style={floatingCardStyle}
    >
      <Key />
    </div>
    <div
      className='absolute bottom-[53px] start-[17%] flex -rotate-3 items-center gap-2 rounded-[14px] border border-solid border-[var(--modern-border-strong)] px-3 py-2 text-[18px] text-[var(--modern-cyan)] shadow-md'
      style={floatingCardStyle}
    >
      <CheckCircle />
      <span className='flex w-[52px] flex-col gap-1'>
        <i className='block h-[5px] w-[87%] rounded-full' style={linePrimaryStyle} />
        <i className='block h-1 rounded-full' style={lineMutedStyle} />
      </span>
    </div>
    <SparkOne />
    <SparkTwo />
  </ArtworkShell>
);

const artworkByScene = {
  upload: UploadArtwork,
  participants: ParticipantsArtwork,
  send: SendArtwork,
  account: AccountArtwork,
  library: LibraryArtwork,
  ready: ReadyArtwork,
  recovery: RecoveryArtwork,
};

const Artwork = ({ scene }) => {
  const SceneArtwork = artworkByScene[scene] || UploadArtwork;
  return <SceneArtwork />;
};

const AuthFeatureCarousel = ({ variant = "login" }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const slides = variant === "signup" ? signupSlides : variant === "recovery" ? recoverySlides : loginSlides;
  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return (
    <Carousel
      className={`w-full max-w-[620px] mx-auto text-[var(--modern-text)] auth-feature-carousel--${variant}`}
      data-bs-theme={theme}
      controls={false}
      indicators={slides.length > 1}
      interval={prefersReducedMotion ? null : 6500}
      pause='hover'
      touch
      wrap
    >
      {slides.map((slide, index) => (
        <Carousel.Item key={`${slide.scene}-${slide.title}`}>
          <section
            className='grid min-h-[470px] md:min-h-[520px] lg:min-h-[555px] xl:min-h-[590px] content-center gap-5 md:gap-6 xl:gap-8 px-1.5 md:px-3 pt-1.5'
            aria-label={t(slide.title)}
          >
            <Artwork scene={slide.scene} />
            <div className='relative max-w-[570px] px-2 pb-5 md:pb-6 text-start'>
              <span className='mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--modern-violet)]'>
                <i
                  className='h-[7px] w-[7px] rounded-full'
                  style={{
                    background: "linear-gradient(135deg, var(--modern-violet), var(--modern-cyan))",
                    boxShadow: "0 0 0 4px var(--modern-violet-soft)",
                  }}
                />
                IAMSigner
              </span>
              <h2 className='m-0 mb-2 max-w-[520px] text-[clamp(22px,2.5vw,28px)] font-bold leading-tight tracking-[-0.035em] text-[var(--modern-text)]'>
                {t(slide.title)}
              </h2>
              <p className='m-0 mb-2.5 text-[15px] font-semibold leading-normal text-[var(--modern-violet)]'>
                {t(slide.subtitle)}
              </p>
              {slide.descriptions.map((description) => (
                <p
                  className='m-0 mb-1.5 max-w-[530px] text-[12px] md:text-[13px] leading-relaxed text-[var(--modern-muted)]'
                  key={description}
                >
                  {t(description)}
                </p>
              ))}
              <span className='absolute bottom-0 end-2 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.05em] text-[var(--modern-muted)]'>
                {String(index + 1).padStart(2, "0")}
                <i className='h-[1px] w-5 bg-[var(--modern-border-strong)]' />
                {String(slides.length).padStart(2, "0")}
              </span>
            </div>
          </section>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default AuthFeatureCarousel;
