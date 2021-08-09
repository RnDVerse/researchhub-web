import { StyleSheet, css } from "aphrodite";
import PropTypes from "prop-types";
import ScrollMenu from "react-horizontal-scrolling-menu";
import { useState, useEffect } from "react";

import colors from "~/config/themes/colors";
import { breakpoints } from "~/config/themes/screen";
import icons from "~/config/themes/icons";

const HorizontalTabBar = ({
  tabs,
  onClick,
  alignCenter = false,
  dragging = false,
  containerStyle = null,
  showArrowsOnWidth = null,
}) => {
  const [pageWidth, setPageWidth] = useState(
    process.browser ? window.innerWidth : 0
  );

  useEffect(() => {
    const _setPageWidth = () => setPageWidth(window.innerWidth);

    window.addEventListener("resize", _setPageWidth, true);

    return () => {
      window.removeEventListener("resize", _setPageWidth, true);
    };
  }, []);

  const renderTab = (tab, index) => {
    const { isSelected, label } = tab;

    return (
      <div
        key={label}
        className={css(styles.tab, isSelected && styles.selectedTab)}
        onClick={() => onClick(tab, index)}
      >
        {label}
      </div>
    );
  };

  const tabsHtml = tabs.map(renderTab);

  return (
    <div className={css(styles.container, containerStyle)}>
      {pageWidth > 0 && (
        <ScrollMenu
          arrowLeft={
            pageWidth <= showArrowsOnWidth ? (
              <NavigationArrow icon={icons.chevronLeft} direction={"left"} />
            ) : null
          }
          arrowRight={
            pageWidth <= showArrowsOnWidth ? (
              <NavigationArrow icon={icons.chevronRight} direction={"right"} />
            ) : null
          }
          data={tabsHtml}
          menuStyle={styles.tabContainer}
          alignCenter={alignCenter}
          dragging={dragging}
        />
      )}
    </div>
  );
};

export const NavigationArrow = ({ icon, direction }) => {
  const classNames = [navStyles.arrowContainer];

  if (direction === "left") {
    classNames.push(navStyles.arrowLeft);
  } else {
    classNames.push(navStyles.arrowRight);
  }

  return <div className={css(classNames)}>{icon}</div>;
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "flex-start",
    boxSizing: "border-box",
    borderBottom: `1px solid ${colors.BLACK(0.1)}`,
  },
  tabContainer: {
    display: "flex",
    width: "100%",
    justifyContent: "flex-start",
  },
  tab: {
    color: colors.BLACK(0.5),
    padding: "1rem",
    textTransform: "capitalize",
    fontSize: 16,
    fontWeight: 500,
    cursor: "pointer",
    ":active": {
      color: colors.PURPLE(),
      cursor: "pointer",
    },
    ":hover": {
      color: colors.PURPLE(),
    },
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      padding: 16,
      fontSize: 16,
    },
  },
  selectedTab: {
    color: colors.PURPLE(),
    borderBottom: "solid 3px",
    borderColor: colors.PURPLE(),
  },
});

const navStyles = StyleSheet.create({
  arrowContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    maxHeight: 40,
    minHeight: 40,
    height: 40,
    maxWidth: 40,
    minWidth: 40,
    width: 40,
    fontSize: 20,
    borderRadius: "50%",
    background: "#FFF",
    boxSizing: "border-box",
    color: colors.PURPLE(),
    border: "1.5px solid rgba(151, 151, 151, 0.2)",
    cursor: "pointer",
    boxShadow: "0 0 15px rgba(255, 255, 255, 0.14)",
    ":hover": {
      background: "#FAFAFA",
    },
  },
  arrowLeft: {
    paddingRight: 2,
  },
  arrowRight: {
    paddingLeft: 5,
  },
});

HorizontalTabBar.propTypes = {
  tabs: PropTypes.array.isRequired,
  onClick: PropTypes.func.isRequired,
  alignCenter: PropTypes.bool,
  dragging: PropTypes.bool,
  containerStyle: PropTypes.object,
  showArrowsOnWidth: PropTypes.number,
};

export default HorizontalTabBar;