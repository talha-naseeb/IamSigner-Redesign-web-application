// Icons
import { MdOutlineNotificationAdd, MdOutlineLockPerson, MdOutlineAddchart } from "react-icons/md";
import { FaSignature, FaBars } from "react-icons/fa";
import { AiOutlineDelete } from "react-icons/ai";
import { LuDownload, LuMinusCircle } from "react-icons/lu";
import { IoDocumentAttachOutline } from "react-icons/io5";
import { TbTemplateOff, TbUserShield } from "react-icons/tb";
import { TbLayoutGridAdd } from "react-icons/tb";
import { BsRobot } from "react-icons/bs";

import {
  LuFileText,
  LuFolder,
  LuLayers,
  LuFiles,
  LuBan,
  LuXCircle,
  LuLogOut,
  LuUser,
  LuCheckCircle,
  LuBookmark,
  LuRefreshCcw,
  LuPlusCircle,
  LuUsers,
  LuBuilding2,
  LuWebhook,
  LuMail,
  LuSettings,
  LuBarChart3,
  LuClipboardCheck,
  LuUserCheck,
  LuFileSearch,
  LuMoreHorizontal,
  LuShare2,
  LuSearch,
  LuEye,
  LuTrash2,
  LuInfo,
  LuClipboardEdit,
  LuLayoutTemplate,
  LuCalendarDays,
  LuUserCog,
  LuLock,
  LuChevronLeft,
  LuMailOpen,
  LuFolderPlus,
  LuFilter,
  LuFileCheck,
  LuFolderCheck,
  LuPalette,
  LuPackage,
  LuMessageSquare,
  LuFileSignature,
  LuSend,
  LuRotateCcw,
  LuPlayCircle,
  LuSun,
  LuMoon,
} from "react-icons/lu";

import { TbClipboardCopy } from "react-icons/tb";
import { MdDragIndicator } from "react-icons/md";
import { RiMailSendLine } from "react-icons/ri";
import { IoIosArrowUp } from "react-icons/io";
import { IoIosArrowDown } from "react-icons/io";
import { FaArrowRightLong, FaArrowDownLong } from "react-icons/fa6";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import { FaCheck, FaRegCopy, FaUsers } from "react-icons/fa6";
import { HiOutlineDocumentDownload } from "react-icons/hi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiRefreshCcw } from "react-icons/fi";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { FaRegFileWord } from "react-icons/fa";
import { PiMicrosoftExcelLogo } from "react-icons/pi";
import { MdOutgoingMail, MdOutlineMoveDown, MdControlPointDuplicate, MdEmail, MdOutlineTextFields } from "react-icons/md";
import { HiOutlineDocumentAdd } from "react-icons/hi";
import { VscHome } from "react-icons/vsc";
import { MdOutlinePending } from "react-icons/md";
import { BsCloudUpload, BsFiletypeKey, BsFillCalendarDateFill } from "react-icons/bs";
import { TfiWorld } from "react-icons/tfi";
import { TbAlertCircle, TbShareOff, TbFolders, TbExchange, TbUserSearch, TbNumbers, TbListCheck } from "react-icons/tb";
import { PiFoldersFill, PiTextTFill } from "react-icons/pi";
import { PiSignature } from "react-icons/pi";
import { RiEyeFill, RiEyeOffFill, RiEdit2Fill, RiListRadio, RiImageAddFill } from "react-icons/ri";
import { TbListDetails } from "react-icons/tb";
import { IoToggle, IoQrCodeSharp } from "react-icons/io5";
import { PiToggleLeftFill } from "react-icons/pi";
import { HiOutlineDocumentText, HiBuildingOffice, HiOutlineClipboardDocumentCheck } from "react-icons/hi2";
import { MdEditDocument } from "react-icons/md";
import { TbEdit } from "react-icons/tb";
import { BsFileEarmarkPdf } from "react-icons/bs";
import { FaListCheck } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { IoIosAddCircleOutline } from "react-icons/io";
import { BiErrorCircle } from "react-icons/bi";
import { FaStamp, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { BsFiletypeCsv } from "react-icons/bs";
import { MdOutlineAttachEmail } from "react-icons/md";
import { BiMessageSquareEdit } from "react-icons/bi";
import { MdOutlineSettingsSuggest } from "react-icons/md";
import { BsFileEarmarkLock2 } from "react-icons/bs";
import { FaMagento } from "react-icons/fa";
import { MdAddToDrive } from "react-icons/md";


// Images
import dropboxIcon from "@/assets/images/Dropbox Cobranding.svg";
import googleDriveIcon from "@/assets/images/googleDriveCobranding.svg";
import oneDriveICon from "@/assets/images/oneDriveIntegrate.svg";
import localIcon from "@/assets/images/monitorCobranding.svg";
import robotImg from "@/assets/images/robot.svg";
import rectangleBox from "@/assets/images/rectangle.png";
import { FaRegComments } from "react-icons/fa6";
import DeleteSignatoryImg from "@/assets/images/deleteSign.svg";
import colorWheel from "@/assets/images/color-wheel.webp";
import signatoryDefaultImg from "@/assets/images/signatory.svg";
import { BiSolidUserRectangle } from "react-icons/bi";
import { BsVectorPen } from "react-icons/bs";
import arrowAnimation from "@/assets/images/arrow-animation.webp";
import iamSignerFullLogo from "@/assets/images/iamsigner-full-logo.png";
import "./brandLogo.css";
import stepperCompleted from "@/assets/images/stepper_completed.svg";
import checkCircleImg from "@/assets/images/Check Circle.svg";
import ExpireImage from "@/assets/images/ExpireImage.png";


const IamSignerFullLogo = ({ className = "", style, alt = "IAMSigner", ...props }) => (
  <span
    {...props}
    className={`iam-signer-full-logo ${className}`.trim()}
    role="img"
    aria-label={alt}
    style={{ width: "140px", height: "45px", ...style }}
  >
    <img className="iam-signer-full-logo__art" src={iamSignerFullLogo} alt="" aria-hidden="true" draggable="false" />
    <img className="iam-signer-full-logo__light-wordmark" src={iamSignerFullLogo} alt="" aria-hidden="true" draggable="false" />
  </span>
);

export const Icons = {
  MacDrive: MdAddToDrive,
  Automation: BsRobot,
  Home: VscHome,
  Templates: LuLayoutTemplate,
  Folders: LuFolder,
  BulkSend: LuLayers,
  BulkDocuments: LuFiles,
  Inactive: LuBan,
  Declined: LuXCircle,
  Logout: LuLogOut,
  Profile: LuUser,
  Completed: LuCheckCircle,
  Draft: LuBookmark,
  Pending: MdOutlinePending,
  Recall: LuRefreshCcw,
  Upload: HiOutlineDocumentAdd,
  TeamMembers: LuUsers,
  Department: LuBuilding2,
  Integrations: LuWebhook,
  EmailTemplates: LuMail,
  AccountSettings: LuSettings,
  Dashboard: LuBarChart3,
  UserDashboard: LuClipboardCheck,
  AdminMenu: LuUserCheck,
  BusinessDetails: LuBarChart3,
  UserDocumentReport: LuFileSearch,
  UserReport: LuUsers,
  DocumentReport: LuFileText,
  Share: LuShare2,
  SelfSign: PiSignature,
  CraftDocument: LuClipboardEdit,
  More: LuMoreHorizontal,
  Plus: LuPlusCircle,
  Search: LuSearch,
  Clear: LuXCircle,
  PDFs: BsFileEarmarkPdf,
  View: LuEye,
  Info: LuInfo,
  UploadCloud: BsCloudUpload,
  Language: TfiWorld,
  Calendar: LuCalendarDays,
  Alert: TbAlertCircle,
  EditProfile: LuUserCog,
  Lock: LuLock,
  Mail: MdOutgoingMail,
  Api: BsFiletypeKey,
  EditSquare: LuClipboardEdit,
  DeleteAction: LuTrash2,
  Copy: FaRegCopy,
  Check: FaCheck,
  Refresh: FiRefreshCcw,
  InfoOutline: IoIosInformationCircleOutline,
  Eye: RiEyeFill,
  EyeOff: RiEyeOffFill,
  Webhook: LuWebhook,
  Download: HiOutlineDocumentDownload,
  Users: FaUsers,
  Excel: PiMicrosoftExcelLogo,
  Word: FaRegFileWord,
  Active: IoToggle,
  InactiveAction: PiToggleLeftFill,
  ViewDetails: TbListDetails,
  Back: LuChevronLeft,
  CoBranding: LuPalette,
  PricingPlan: LuPackage,
  CV: HiOutlineDocumentText,
  Message: LuMessageSquare,
  Contract: LuFileSignature,
  CoverLetter: LuMailOpen,
  Agreement: MdEditDocument,
  OtherDoc: BsThreeDotsVertical,
  FolderPlus: LuFolderPlus,
  Unshare: TbShareOff,
  SubFolders: TbFolders,
  AuditTrail: HiOutlineDocumentSearch,
  Filter: LuFilter,
  PDFCheck: LuFileCheck,
  FolderCheck: LuFolderCheck,
  FoldersFill: PiFoldersFill,
  PenEdit: TbEdit,
  SignOrder: FaListCheck,
  Comments: FaRegComments,
  Send: LuSend,
  Resend: RiMailSendLine,
  RecallAction: LuRotateCcw,
  NotStarted: LuPlayCircle,
  TransferOwner: MdOutlineMoveDown,
  UpdateSignOrder: TbExchange,
  ArrowRightLong: FaArrowRightLong,
  ArrowDownLong: FaArrowDownLong,
  CopyTemplate: TbClipboardCopy,
  UserSearch: TbUserSearch,
  Duplicate: MdControlPointDuplicate,
  EditFilled: RiEdit2Fill,
  CloseSmall: RxCross2,
  AddCircle: IoIosAddCircleOutline,
  ContractFilled: LuFileSignature,
  DateFilled: BsFillCalendarDateFill,
  UserFilled: BiSolidUserRectangle,
  EmailFilled: MdEmail,
  TextFields: MdOutlineTextFields,
  Stamp: FaStamp,
  Initials: PiTextTFill,
  QRCode: IoQrCodeSharp,
  Numbers: TbNumbers,
  RadioList: RiListRadio,
  CheckboxList: TbListCheck,
  ImageAdd: RiImageAddFill,
  Building: HiBuildingOffice,
  AlertCircle: BiErrorCircle,
  SignatureType: BsVectorPen,
  DragHandle: MdDragIndicator,
  ArrowUp: IoIosArrowUp,
  ArrowDown: IoIosArrowDown,
  ArrowUpFilled: FaArrowUp,
  ArrowDownFilled: FaArrowDown,
  DownloadAction: LuDownload,
  DeleteOutline: AiOutlineDelete,
  NotificationAdd: MdOutlineNotificationAdd,
  LockPerson: MdOutlineLockPerson,
  DocumentAttach: IoDocumentAttachOutline,
  SignatureOutline: FaSignature,
  MinusCircle: LuMinusCircle,
  UploadCSV: BsFiletypeCsv,
  customMessage: BiMessageSquareEdit,
  customEmail: MdOutlineAttachEmail,
  advancedSettings: MdOutlineSettingsSuggest,
  FolderOpen: LuFolder,
  ApplyTemplate: TbLayoutGridAdd,
  RemoveTemplate: TbTemplateOff,
  VerificationMethod: BsFileEarmarkLock2,
  Sun: LuSun,
  Moon: LuMoon,
  MacAI: FaMagento,
  Hamburger: FaBars,
  DocumentStatus: MdOutlineAddchart,
  AdminShield: TbUserShield,
  UserReportShield: HiOutlineClipboardDocumentCheck,

  ColorWheel: (props) => <img src={colorWheel} alt='Loading...' {...props} />,
  DeleteSignatory: (props) => <img src={DeleteSignatoryImg} alt='Loading...' {...props} />,
  GoogleDrive: (props) => <img src={googleDriveIcon} alt='Loading...' {...props} />,
  Dropbox: (props) => <img src={dropboxIcon} alt='Loading...' {...props} />,
  OneDrive: (props) => <img src={oneDriveICon} alt='Loading...' {...props} />,
  Local: (props) => <img src={localIcon} alt='Loading...' {...props} />,
  Robot: (props) => <img src={robotImg} alt='Loading...' {...props} />,
  MacAiBackground: (props) => <img src={rectangleBox} alt='Loading...' {...props} />,
  SignatureDefault: (props) => <img src={signatoryDefaultImg} alt='Loading...' {...props} />,
  ArrowGif: (props) => <img src={arrowAnimation} alt='Loading...' {...props} />,
  StepperLogo: (props) => <IamSignerFullLogo {...props} />,
  StepperCompleted: (props) => <img src={stepperCompleted} alt='Loading...' {...props} />,
  CheckCircle: (props) => <img src={checkCircleImg} alt='Loading...' {...props} />,
  IamSignerLightMode: (props) => <IamSignerFullLogo {...props} />,
  Expire: (props) => <img src={ExpireImage} alt='Loading...' {...props} />,
};
