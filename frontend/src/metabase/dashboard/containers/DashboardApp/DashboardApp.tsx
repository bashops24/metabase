import cx from "classnames";
import type { ReactNode } from "react";
import { useCallback, useEffect } from "react";
import type { ConnectedProps } from "react-redux";
import { connect } from "react-redux";
import type { Route } from "react-router";
import { push } from "react-router-redux";
import { useUnmount } from "react-use";
import { t } from "ttag";
import _ from "underscore";

import { LeaveConfirmationModal } from "metabase/components/LeaveConfirmationModal";
import CS from "metabase/css/core/index.css";
import { Dashboard } from "metabase/dashboard/components/Dashboard/Dashboard";
import favicon from "metabase/hoc/Favicon";
import title from "metabase/hoc/Title";
import titleWithLoadingTime from "metabase/hoc/TitleWithLoadingTime";
import { useLoadingTimer } from "metabase/hooks/use-loading-timer";
import { useUniqueId } from "metabase/hooks/use-unique-id";
import { useWebNotification } from "metabase/hooks/use-web-notification";
import { parseHashOptions } from "metabase/lib/browser";
import { useDispatch } from "metabase/lib/redux";
import * as Urls from "metabase/lib/urls";
import { closeNavbar, setErrorPage } from "metabase/redux/app";
import { addUndo, dismissUndo } from "metabase/redux/undo";
import { getIsNavbarOpen } from "metabase/selectors/app";
import { getMetadata } from "metabase/selectors/metadata";
import {
  canManageSubscriptions,
  getUserIsAdmin,
} from "metabase/selectors/user";
import type { DashboardId, Database, DatabaseId } from "metabase-types/api";
import type { State } from "metabase-types/store";

import * as dashboardActions from "../../actions";
import { DASHBOARD_SLOW_TIMEOUT } from "../../constants";
import {
  getCardData,
  getClickBehaviorSidebarDashcard,
  getDashboardBeforeEditing,
  getDashboardComplete,
  getDocumentTitle,
  getDraftParameterValues,
  getEditingParameter,
  getFavicon,
  getIsAdditionalInfoVisible,
  getIsAddParameterPopoverOpen,
  getIsAutoApplyFilters,
  getIsDirty,
  getIsEditing,
  getIsEditingParameter,
  getIsHeaderVisible,
  getIsLoadingComplete,
  getIsNavigatingBackToDashboard,
  getIsRunning,
  getIsSharing,
  getLoadingStartTime,
  getParameters,
  getParameterValues,
  getSelectedTabId,
  getSidebar,
  getSlowCards,
  getEmbeddedParameterVisibility,
} from "../../selectors";

type OwnProps = {
  dashboardId?: DashboardId;
  route: Route;
  params: { slug: string };
  children?: ReactNode;
};

const mapStateToProps = (state: State) => {
  const metadata = getMetadata(state);
  return {
    canManageSubscriptions: canManageSubscriptions(state),
    isAdmin: getUserIsAdmin(state),
    isNavbarOpen: getIsNavbarOpen(state),
    isEditing: getIsEditing(state),
    isSharing: getIsSharing(state),
    dashboardBeforeEditing: getDashboardBeforeEditing(state),
    isEditingParameter: getIsEditingParameter(state),
    isDirty: getIsDirty(state),
    dashboard: getDashboardComplete(state),
    dashcardData: getCardData(state),
    slowCards: getSlowCards(state),
    // this type is a bandaid until we can fix the type of metadata.databases
    databases: metadata.databases as Record<DatabaseId, Database>,
    editingParameter: getEditingParameter(state),
    parameters: getParameters(state),
    parameterValues: getParameterValues(state),
    draftParameterValues: getDraftParameterValues(state),

    metadata,
    loadingStartTime: getLoadingStartTime(state),
    clickBehaviorSidebarDashcard: getClickBehaviorSidebarDashcard(state),
    isAddParameterPopoverOpen: getIsAddParameterPopoverOpen(state),
    sidebar: getSidebar(state),
    pageFavicon: getFavicon(state),
    documentTitle: getDocumentTitle(state),
    isRunning: getIsRunning(state),
    isLoadingComplete: getIsLoadingComplete(state),
    isHeaderVisible: getIsHeaderVisible(state),
    isAdditionalInfoVisible: getIsAdditionalInfoVisible(state),
    selectedTabId: getSelectedTabId(state),
    isAutoApplyFilters: getIsAutoApplyFilters(state),
    isNavigatingBackToDashboard: getIsNavigatingBackToDashboard(state),
    getEmbeddedParameterVisibility: (slug: string) =>
      getEmbeddedParameterVisibility(state, slug),
  };
};

const mapDispatchToProps = {
  ...dashboardActions,
  closeNavbar,
  setErrorPage,
  onChangeLocation: push,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type ReduxProps = ConnectedProps<typeof connector>;

type DashboardAppProps = OwnProps & ReduxProps;

const DashboardApp = (props: DashboardAppProps) => {
  const { dashboard, isRunning, isLoadingComplete, isEditing, isDirty, route } =
    props;

  const options = parseHashOptions(window.location.hash);
  const editingOnLoad = options.edit;
  const addCardOnLoad = options.add != null ? Number(options.add) : undefined;

  const dispatch = useDispatch();

  const { requestPermission, showNotification } = useWebNotification();

  useUnmount(() => {
    dispatch(dashboardActions.reset());
    dispatch(dashboardActions.closeDashboard());
  });

  const slowToastId = useUniqueId();

  useEffect(() => {
    if (isLoadingComplete) {
      if (
        "Notification" in window &&
        Notification.permission === "granted" &&
        document.hidden
      ) {
        showNotification(
          t`All Set! ${dashboard?.name} is ready.`,
          t`All questions loaded`,
        );
      }
    }

    return () => {
      dispatch(dismissUndo(slowToastId));
    };
  }, [
    dashboard?.name,
    dispatch,
    isLoadingComplete,
    showNotification,
    slowToastId,
  ]);

  const onConfirmToast = useCallback(async () => {
    await requestPermission();
    dispatch(dismissUndo(slowToastId));
  }, [dispatch, requestPermission, slowToastId]);

  const onTimeout = useCallback(() => {
    if ("Notification" in window && Notification.permission === "default") {
      dispatch(
        addUndo({
          id: slowToastId,
          timeout: false,
          message: t`Would you like to be notified when this dashboard is done loading?`,
          action: onConfirmToast,
          actionLabel: t`Turn on`,
        }),
      );
    }
  }, [dispatch, onConfirmToast, slowToastId]);

  useLoadingTimer(isRunning, {
    timer: DASHBOARD_SLOW_TIMEOUT,
    onTimeout,
  });

  return (
    <div className={cx(CS.shrinkBelowContentSize, CS.fullHeight)}>
      <LeaveConfirmationModal isEnabled={isEditing && isDirty} route={route} />

      {/* Suppressing for now until we can get the prop-drilled types sorted out. Previously DashboardControls was a JS file so types weren't checked, but now there's a Pandora's box here */}
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-expect-error */}
      <Dashboard
        dashboardId={getDashboardId(props)}
        editingOnLoad={editingOnLoad}
        addCardOnLoad={addCardOnLoad}
        {...props}
      />
      {/* For rendering modal urls */}
      {props.children}
    </div>
  );
};

function getDashboardId({ dashboardId, params }: DashboardAppProps) {
  if (dashboardId) {
    return dashboardId;
  }
  return Urls.extractEntityId(params.slug) as DashboardId;
}

export const DashboardAppConnected = _.compose(
  connector,
  favicon(({ pageFavicon }: Pick<ReduxProps, "pageFavicon">) => pageFavicon),
  title(
    ({
      dashboard,
      documentTitle,
    }: Pick<ReduxProps, "dashboard" | "documentTitle">) => ({
      title: documentTitle || dashboard?.name,
      titleIndex: 1,
    }),
  ),
  titleWithLoadingTime("loadingStartTime"),
)(DashboardApp);
