import React from "react";
import { useTranslation } from "react-i18next";
import { Carousel as Carousel } from "@/Components/UI/shadcnCompat";
import { FiActivity, FiCheck, FiCheckCircle, FiCloud, FiFileText, FiFolder, FiKey, FiLock, FiMail, FiPenTool, FiSend, FiShield, FiUploadCloud, FiUser, FiUsers } from "react-icons/fi";
import { useTheme } from "@/Context/ThemeContext";
import "./AuthFeatureCarousel.css";

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

const UploadArtwork = () => (
  <div className='auth-artwork auth-artwork--upload' aria-hidden='true'>
    <div className='upload-art-stack upload-art-stack--back' />
    <div className='upload-art-stack upload-art-stack--front'>
      <FiFileText />
      <span className='auth-art-lines'><i /><i /></span>
    </div>
    <div className='upload-art-dropzone'>
      <span className='upload-art-cloud'><FiCloud /></span>
      <span className='upload-art-dash' />
      <span className='upload-art-dash upload-art-dash--short' />
      <span className='upload-art-progress'><i /></span>
    </div>
    <div className='upload-art-badge'><FiCheckCircle /><span className='auth-art-lines'><i /><i /></span></div>
    <span className='auth-artwork__spark auth-artwork__spark--one' />
    <span className='auth-artwork__spark auth-artwork__spark--two' />
  </div>
);

const ParticipantsArtwork = () => (
  <div className='auth-artwork auth-artwork--participants' aria-hidden='true'>
    <svg className='participants-art-connectors' viewBox='0 0 560 300' preserveAspectRatio='none'>
      <path d='M114 80 C165 80 176 133 224 143' />
      <path d='M445 67 C397 69 380 124 337 139' />
      <path d='M126 230 C171 218 181 183 224 167' />
      <path d='M433 227 C386 218 376 185 337 166' />
    </svg>
    <div className='participants-art-document'>
      <div className='participants-art-title'><FiFileText /><span className='auth-art-lines'><i /><i /></span></div>
      <div className='participants-art-lines'><i /><i /><i /><i /><i /></div>
      <div className='participants-art-signature'><FiPenTool /><span /></div>
    </div>
    <div className='participants-art-person participants-art-person--one'><span className='participants-art-avatar'>A</span><span className='auth-art-lines'><i /><i /></span><FiCheck /></div>
    <div className='participants-art-person participants-art-person--two'><span className='participants-art-avatar'>M</span><span className='auth-art-lines'><i /><i /></span><FiPenTool /></div>
    <div className='participants-art-person participants-art-person--three'><span className='participants-art-avatar'>J</span><span className='auth-art-lines'><i /><i /></span><FiCheck /></div>
    <div className='participants-art-person participants-art-person--four'><span className='participants-art-avatar'>S</span><span className='auth-art-lines'><i /><i /></span><FiCheck /></div>
    <span className='auth-artwork__spark auth-artwork__spark--one' />
    <span className='auth-artwork__spark auth-artwork__spark--two' />
  </div>
);

const SendArtwork = () => (
  <div className='auth-artwork auth-artwork--send' aria-hidden='true'>
    <div className='send-art-paper'>
      <span className='send-art-paper-icon'><FiFileText /></span>
      <span className='auth-art-lines'><i /><i /><i /></span>
      <span className='send-art-signature'><FiPenTool /></span>
    </div>
    <div className='send-art-envelope'><span /><i /></div>
    <div className='send-art-route'><i /><i /><i /></div>
    <div className='send-art-delivered'><span><FiCheck /></span><span className='auth-art-lines'><i /><i /></span></div>
    <div className='send-art-mail-icon'><FiMail /></div>
    <span className='auth-artwork__spark auth-artwork__spark--one' />
    <span className='auth-artwork__spark auth-artwork__spark--two' />
  </div>
);

const AccountArtwork = () => (
  <div className='auth-artwork auth-artwork--account' aria-hidden='true'>
    <div className='account-art-card'>
      <div className='account-art-avatar'><FiUser /></div>
      <span className='account-art-heading auth-art-lines'><i /><i /></span>
      <div className='account-art-field'><FiMail /><span /></div>
      <div className='account-art-field'><FiLock /><span /></div>
      <div className='account-art-action'><FiCheck /><span /></div>
    </div>
    <div className='account-art-badge'><FiShield /></div>
    <span className='account-art-orbit account-art-orbit--one' />
    <span className='account-art-orbit account-art-orbit--two' />
    <span className='auth-artwork__spark auth-artwork__spark--one' />
  </div>
);

const LibraryArtwork = () => (
  <div className='auth-artwork auth-artwork--library' aria-hidden='true'>
    <div className='library-art-board'>
      <div className='library-art-top'><span /><span /><span /></div>
      <div className='library-art-grid'>
        <div className='library-art-folder library-art-folder--violet'><FiFolder /><i /><i /></div>
        <div className='library-art-folder library-art-folder--blue'><FiFileText /><i /><i /></div>
        <div className='library-art-folder library-art-folder--cyan'><FiFolder /><i /><i /></div>
        <div className='library-art-folder library-art-folder--pink'><FiFileText /><i /><i /></div>
      </div>
    </div>
    <div className='library-art-count'><FiActivity /><span className='auth-art-lines'><i /><i /></span><b>+</b></div>
    <div className='library-art-mini'><FiCheckCircle /></div>
    <span className='auth-artwork__spark auth-artwork__spark--two' />
  </div>
);

const ReadyArtwork = () => (
  <div className='auth-artwork auth-artwork--ready' aria-hidden='true'>
    <div className='ready-art-certificate'>
      <span className='ready-art-seal'><FiCheck /></span>
      <span className='ready-art-title auth-art-lines'><i /><i /></span>
      <span className='ready-art-rules'><i /><i /><i /></span>
      <span className='ready-art-signature'><FiPenTool /></span>
    </div>
    <div className='ready-art-star ready-art-star--one'>✦</div>
    <div className='ready-art-star ready-art-star--two'>✦</div>
    <div className='ready-art-star ready-art-star--three'>✧</div>
    <div className='ready-art-ribbon'><FiCheckCircle /></div>
  </div>
);

const RecoveryArtwork = () => (
  <div className='auth-artwork auth-artwork--recovery' aria-hidden='true'>
    <span className='recovery-art-ring recovery-art-ring--outer' />
    <span className='recovery-art-ring recovery-art-ring--middle' />
    <span className='recovery-art-ring recovery-art-ring--inner' />
    <div className='recovery-art-shield'><FiShield /><span><FiLock /></span></div>
    <div className='recovery-art-key'><FiKey /></div>
    <div className='recovery-art-verified'><FiCheckCircle /><span className='auth-art-lines'><i /><i /></span></div>
    <span className='auth-artwork__spark auth-artwork__spark--one' />
    <span className='auth-artwork__spark auth-artwork__spark--two' />
  </div>
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
  const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return (
    <Carousel
      className={`auth-feature-carousel auth-feature-carousel--${variant}`}
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
          <section className='auth-feature-slide' aria-label={t(slide.title)}>
            <Artwork scene={slide.scene} />
            <div className='auth-feature-copy'>
              <span className='auth-feature-copy__marker'><i /> IAMSigner</span>
              <h2>{t(slide.title)}</h2>
              <p className='auth-feature-copy__subtitle'>{t(slide.subtitle)}</p>
              {slide.descriptions.map((description) => (
                <p className='auth-feature-copy__description' key={description}>{t(description)}</p>
              ))}
              <span className='auth-feature-copy__step'>{String(index + 1).padStart(2, "0")} <i /> {String(slides.length).padStart(2, "0")}</span>
            </div>
          </section>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default AuthFeatureCarousel;
