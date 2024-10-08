import { StyleSheet, css } from "aphrodite";
import BaseModal from "../Modals/BaseModal";
import colors from "~/config/themes/colors";
import { useEffect, useState } from "react";
import ProgressStepper, {
  ProgressStepperStep,
} from "../shared/ProgressStepper";
import Button from "../Form/Button";
import IconButton from "~/components/Icons/IconButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faInfoCircle as faInfoCircleLight,
} from "@fortawesome/pro-light-svg-icons";
import { submitRewardsClaim, fetchEligiblePaperRewards } from "./lib/api";
import useCurrentUser from "~/config/hooks/useCurrentUser";
import { ID } from "~/config/types/root_types";
import { RewardSummary, parseRewardSummary } from "./lib/types";
import ClaimRewardSummary from "./lib/ClaimRewardSummary";
import FormInput from "../Form/FormInput";
import { isValidURL } from "~/config/utils/validation";
import { faChartPie, faCircleCheck, faFlask, faLockOpen } from "@fortawesome/pro-solid-svg-icons";
import Image from "next/image";
import ResearchCoinIcon from "../Icons/ResearchCoinIcon";
import { ClipLoader } from "react-spinners";

interface Props {
  isOpen: boolean;
  paperId: ID;
  paperTitle: string;
  closeModal: () => void;
}

export type STEP =
  | "INTRO"
  | "OPEN_DATA"
  | "PREREGRISTRATION"
  | "CLAIM_SUBMITTED"
  | "CLAIM_ERROR";

export const ORDERED_STEPS: STEP[] = [
  "INTRO",
  "OPEN_DATA",
  "PREREGRISTRATION",
  "CLAIM_ERROR",
];

const stepperSteps: ProgressStepperStep[] = [
  {
    title: "Open Data",
    number: 1,
    value: "OPEN_DATA",
  },
  {
    title: "Preregistration",
    number: 2,
    value: "PREREGRISTRATION",
  },
  {
    title: "Submit Claim",
    number: 3,
    value: "CLAIM_SUBMITTED",
  },
];

const YesNoBlock = ({
  selection,
  label,
  handleClick,
}: {
  selection: "YES" | "NO" | null;
  label: string;
  handleClick: Function;
}) => {
  return (
    <div className={css(blockStyles.yesNoBlock)}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          justifyContent: "space-between",
        }}
      >
        <div className={css(blockStyles.yesNoLabel)}>{label}</div>
        <div className={css(blockStyles.buttonsWrapper)}>
          <div className={css(blockStyles.btnWrapper)}>
            <Button
              fullWidth
              onClick={() => handleClick("YES")}
              variant={selection === "YES" ? "contained" : "outlined"}
            >
              Yes
            </Button>
          </div>
          <div className={css(blockStyles.btnWrapper)}>
            <Button
              fullWidth
              onClick={() => handleClick("NO")}
              variant={selection === "NO" ? "contained" : "outlined"}
            >
              No
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const blockStyles = StyleSheet.create({
  yesNoBlock: {},
  btnWrapper: {
    width: 100,
  },
  yesNoLabel: {
    maxWidth: 350,
    fontWeight: 500,
  },
  buttonsWrapper: {
    display: "flex",
    gap: 10,
  },
});

const ClaimRewardsModal = ({
  paperId,
  paperTitle,
  isOpen,
  closeModal,
}: Props) => {
  const [step, setStep] = useState<STEP>("INTRO");
  const [openDataUrl, setOpenDataUrl] = useState<string | null>(null);
  const [preregistrationUrl, setPreregistrationUrl] = useState<string | null>(
    null
  );
  const [isOpenData, setIsOpenData] = useState<boolean | null>(null);
  const [isPreregistered, setIsPreregistered] = useState<boolean | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const currentUser = useCurrentUser();
  const [rewardSummary, setRewardSummary] = useState<RewardSummary | null>(
    null
  );

  const handleNext = () => {
    const currentStepPos = ORDERED_STEPS.indexOf(step);

    const isLastStep = step === "PREREGRISTRATION";
    if (isLastStep) {
      handleSubmitClaim();
      return;
    } else {
      const nextStep = ORDERED_STEPS[currentStepPos + 1];
      setStep(nextStep);
    }
  };

  const handleSubmitClaim = async () => {
    if (!currentUser) {
      return;
    }
    setIsFetching(true);

    try {
      const response = await submitRewardsClaim({
        paperId,
        userId: currentUser.id,
        preregistrationUrl,
        openDataUrl,
      });

      if (!response.ok) {
        alert(
          "Failed to submit claim. If a claim has already been submitted, please wait for the review process to complete."
        );
      }
      else {
        setStep("CLAIM_SUBMITTED");
      }

      setIsFetching(false);
    } catch (error) {
      setIsFetching(false);
      alert(
        "Failed to submit claim. If a claim has already been submitted, please wait for the review process to complete."
      );
    }
  };

  useEffect(() => {
    (async () => {
      if (paperId) {
        const response = await fetchEligiblePaperRewards({ paperId });
        const rewardSummary = parseRewardSummary(response);
        setRewardSummary(rewardSummary);
      }
    })();
  }, [paperId]);

  const resetModal = () => {
    setStep("INTRO");
    setOpenDataUrl(null);
    setPreregistrationUrl(null);
    setIsOpenData(null);
    setIsPreregistered(null);
  }

  const currentStepPos = ORDERED_STEPS.indexOf(step);
  return (
    <BaseModal
      isOpen={isOpen}
      hideClose={false}
      closeModal={() => {
        resetModal();
        closeModal();
      }}
      zIndex={1000000}
      modalContentStyle={["INTRO", "CLAIM_SUBMITTED"].includes(step) ? styles.modalStyleIntro : styles.modalStyle}
    >
      <div>
        {/* FIXME: Temporariy turnign off breadcrumbs until we support open access PDF upload */}
        {/* {!["CLAIM_SUBMITTED", "INTRO"].includes(step) && (
          <div className={css(styles.breadcrumbsWrapper)}>
            <ProgressStepper selected={step} steps={stepperSteps} />
          </div>
        )} */}

        {currentStepPos > 0 && (
          <IconButton overrideStyle={styles.backButton}>
            <FontAwesomeIcon
              icon={faArrowLeft}
              onClick={() => {
                const prevStep = ORDERED_STEPS[currentStepPos - 1];
                setStep(prevStep);
              }}
            />
          </IconButton>
        )}

        {step === "INTRO" && (
          <>
            <div className={css(styles.largeTitle, styles.introTitle)}>
              <ResearchCoinIcon
                height={40}
                width={40}
                color={colors.NEW_GREEN()}
                version={4}
              />
              <div style={{ marginTop: 10, }}>
                Claim RSC rewards on your paper
              </div>
            </div>
            <div className={css(styles.slide)}>
              <div className={css(styles.largeText)}>
                At ResearchHub, we use RSC rewards to encourage the creation of
                high-quality research outputs. To us this means science that is:
              </div>
              <div className={css(styles.lineItems, styles.lineItemsForIntro)}>
                <div className={css(styles.lineItem)}>
                  <div className={css(styles.lineItemIcon)}>
                    <FontAwesomeIcon icon={faLockOpen} fontSize={20} />
                  </div>
                  Open access
                </div>
                <div className={css(styles.lineItem)}>
                  <div className={css(styles.lineItemIcon)}>
                    <FontAwesomeIcon icon={faChartPie} fontSize={20} />
                  </div>
                  Accompanied by open data
                </div>
                <div className={css(styles.lineItem)}>
                  <div className={css(styles.lineItemIcon)}>
                    <Image
                      alt="Scan"
                      width={27}
                      height={27}
                      src={"/static/icons/blueprint_gray.svg"}
                    />
                  </div>
                  Preregistered
                </div>
              </div>
            </div>
          </>
        )}
        {step === "OPEN_DATA" && (
          <>
            <div className={css(styles.title, styles.sectionTitle)}>
              <FontAwesomeIcon icon={faChartPie} color={colors.NEW_BLUE()} />
              Open Data
            </div>
            <div className={css(styles.description)}>
              Open data allows the scientific community to audit the claims made
              in the paper by examining the data and reproducing the results. By
              providing a link to the open data set associated with this paper,
              your paper will be eligible for additional RSC rewards.
            </div>
            <YesNoBlock
              selection={
                isOpenData ? "YES" : isOpenData === false ? "NO" : null
              }
              label="Is there an open data set freely and publicly available?"
              handleClick={(selection) =>
                setIsOpenData(selection === "YES" ? true : false)
              }
            />
            <div style={{ display: isOpenData ? "block" : "none" }}>
              <FormInput
                error={
                  openDataUrl &&
                  !isValidURL(openDataUrl) &&
                  "Please enter a valid URL"
                }
                value={openDataUrl || ""}
                label="Provide the URL to the publication's dataset:"
                placeholder={"https://opendata.example.com"}
                containerStyle={styles.inputContainer}
                onChange={(name, value) => {
                  setOpenDataUrl(value.trim());
                }}
              />
            </div>
          </>
        )}
        {step === "PREREGRISTRATION" && (
          <>
            <div className={css(styles.title, styles.sectionTitle)}>
              <Image
                alt="Scan"
                width={30}
                height={30}
                src={"/static/icons/blueprint.svg"}
              />
              Preregistration
            </div>
            <div className={css(styles.description)}>
              Preregistration is important to us. It maintains the purity of the
              research by outlining the intentions of the author(s) which leads
              to more reproducible science. By providing a preregistration, your
              paper will be eligible for additional RSC rewards.
            </div>
            <YesNoBlock
              selection={
                isPreregistered
                  ? "YES"
                  : isPreregistered === false
                  ? "NO"
                  : null
              }
              label="Was this paper preregistered prior to publication?"
              handleClick={(selection) =>
                setIsPreregistered(selection === "YES" ? true : false)
              }
            />
            <div style={{ display: isPreregistered ? "block" : "none" }}>
              <FormInput
                error={
                  preregistrationUrl &&
                  !isValidURL(preregistrationUrl) &&
                  "Please enter a valid URL"
                }
                value={preregistrationUrl || ""}
                label="Provide the URL to the publication's preregistration:"
                placeholder={"https://opendata.example.com"}
                containerStyle={styles.inputContainer}
                onChange={(name, value) => {
                  setPreregistrationUrl(value.trim());
                }}
              />
            </div>
          </>
        )}
        {step === "CLAIM_SUBMITTED" && (
          <>
            <div className={css(styles.slide)}>
              <div className={css(styles.largeTitle, styles.introTitle)}>
                <FontAwesomeIcon fontSize="40" icon={faCircleCheck} color={colors.NEW_GREEN()} />
                <div style={{ marginTop: 20, }}>You claimed has been submitted!</div>
              </div>
              <div className={css(styles.largeText)}>
                Once approved, RSC will be deposited in your account. We will notify you when the claim has been processed.
              </div>
              <div className={css(styles.largeText)}>
                Here are some of the things you can do with your RSC:
              </div>
              <div className={css(styles.lineItems)}>
                <div className={css(styles.lineItem)}>
                  <ResearchCoinIcon height={20} width={20} color={colors.MEDIUM_GREY2()} version={4} />
                  Create a bounty
                </div>
                <div className={css(styles.lineItem)}>
                  <FontAwesomeIcon icon={faFlask} fontSize={20} />
                  Fund new research
                </div>
                <div className={css(styles.lineItem)}>
                <ResearchCoinIcon height={24} width={24} color={colors.MEDIUM_GREY2()} version={6} />
                  Tip great content
                </div>
              </div>
            </div>


            <div className={css(styles.footer, styles.noBorder)}>
              <Button fullWidth onClick={() => {
                resetModal();
                closeModal();
              }}>
                Close
              </Button>
            </div>
          </>
        )}

        {step === "INTRO" && (
          <Button
            fullWidth
            onClick={() => handleNext()}
            theme="solidPrimary"
            customButtonStyle={styles.startButton}
            style={{ width: 200, margin: "20px auto" }}
          >
            Let's Start
          </Button>
        )}

        {!["CLAIM_SUBMITTED", "INTRO"].includes(step) && (
          <div className={css(styles.footer)}>
            <div><strong>Paper:</strong> {paperTitle}</div>
            <div style={{ marginTop: 20, marginBottom: 20 }}>
              <ClaimRewardSummary
                baseReward={rewardSummary?.baseRewards || 0}
                isOpenAccess={true}
                isOpenData={openDataUrl !== null}
                isPreregistered={preregistrationUrl !== null}
                preregistrationMultiplier={
                  rewardSummary?.preregistrationMultiplier
                }
                openDataMultiplier={rewardSummary?.openDataMultiplier}
              />
            </div>
            <Button
              fullWidth
              disabled={
                (step === "OPEN_DATA" && isOpenData && !openDataUrl) ||
                (step === "OPEN_DATA" && isOpenData === null) || 
                (step === "PREREGRISTRATION" && isPreregistered === null) || 
                (step === "PREREGRISTRATION" &&
                  isPreregistered &&
                  !preregistrationUrl) ||
                isFetching
              }
              onClick={() => handleNext()}
              theme="solidPrimary"
              style={{ width: 200, margin: "20px auto" }}
            >
              {isFetching ? (
                <ClipLoader loading={true} size={24} color={colors.WHITE()} />
              ) : (
                <>{step === "PREREGRISTRATION" ? "Submit" : "Next"}</>
              )}
            </Button>
          </div>
        )}
      </div>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  introTitle: {
    color: colors.NEW_GREEN(),
  },
  startButton: {
    backgroundColor: colors.NEW_GREEN(),
    borderColor: colors.NEW_GREEN(),
  },
  lineItems: {
    display: "flex",
    flexDirection: "column",
    marginTop: 25,
    width: 210,
    margin: "0 auto",
  },
  lineItemsForIntro: {
    width: 280,
  },
  lineItem: {
    display: "flex",
    gap: 10,
    marginBottom: 10,
    color: colors.MEDIUM_GREY2(),
    alignItems: "center",
  },
  lineItemIcon: {
    width: 30,
    height: 24,
  },
  largeTitle: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    fontSize: 26,
    fontWeight: 500,
    textAlign: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  largeText: {
    color: colors.MEDIUM_GREY2(),
    maxWidth: 400,
    marginBottom: 25,
  },
  inputContainer: {},
  footer: {
    borderTop: `1px solid ${colors.GREY(0.5)}`,
    marginTop: 50,
    paddingTop: 20,
  },
  noBorder: {
    border: "none",
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
  },
  sectionTitle: {
    marginTop: 30,
    fontWeight: 500,
    gap: 10,
    fontSize: 20,
  },
  description: {
    fontSize: 16,
    marginBottom: 30,
  },
  slide: {
    // minHeight: 300,
    textAlign: "center",
    fontSize: 18,
    marginBottom: 20,
  },
  modalStyle: {
    background: "white",
    padding: "20px 20px",
    width: 550,
  },
  modalStyleIntro: {
    backgroundColor: colors.NEW_GREEN(0.1),
    border: `2px solid ${colors.NEW_GREEN()}`,    
    padding: "20px 20px",
    width: 550,
  },
  modalContentStyle: {
    padding: "10px 20px",
  },
  breadcrumbsWrapper: {
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: {
    position: "absolute",
    left: 10,
    top: 7,
    fontSize: 20,
    cursor: "pointer",
  },
});

export default ClaimRewardsModal;
