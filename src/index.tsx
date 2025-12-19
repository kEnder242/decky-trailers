import { definePlugin, routerHook } from "@decky/api";
import { afterPatch, findInReactTree, createReactTreePatcher } from "@decky/ui";
import { FaVideo } from "react-icons/fa";
import * as React from "react";
import { ReactElement } from "react";
import { GameTrailer } from "./components/GameTrailer";

const logger = {
    info: (...args: any[]) => console.log("%c Decky Trailers %c Info %c", "background: #16a085; color: black;", "background: #1abc9c; color: black;", "background: transparent;", ...args),
    error: (...args: any[]) => console.error("%c Decky Trailers %c Error %c", "background: #c0392b; color: white;", "background: #e74c3c; color: white;", "background: transparent;", ...args),
};

export default definePlugin(() => {
  logger.info("Initializing Decky Trailers v0.1.16 (Debug Mode)...");

  let patch: any;

  try {
      patch = routerHook.addPatch("/library/app/:appid", (tree: any) => {
          const routeProps = findInReactTree(tree, (x: any) => x?.renderFunc);
          
          if (!routeProps) {
              return tree;
          }

          const patchHandler = createReactTreePatcher([
              // Path to the element containing the overview section
              (tree: any) => findInReactTree(tree, (x: any) => x?.props?.children?.props?.overview)?.props?.children
          ], (_: any[], ret: ReactElement) => {
              
              // Helper to find the parent container of a target node
              const findParentWithChild = (tree: any, childPredicate: (node: any) => boolean): any => {
              const findParentWithChild = (tree: any, childPredicate: (node: any) => boolean): any => {
                  if (!tree || typeof tree !== 'object') return null;
                  
                  if (tree.props && Array.isArray(tree.props.children)) {
                      if (tree.props.children.some(childPredicate)) {
                          return tree;
                      }
                      for (const child of tree.props.children) {
                          const found = findParentWithChild(child, childPredicate);
                          if (found) return found;
                      }
                  } else if (tree.props && tree.props.children) {
                      return findParentWithChild(tree.props.children, childPredicate);
                  }
                  
                  return null;
              };

              // Identify the ActionBar
              const isActionBar = (n: any) => {
                  return n?.props?.onShowLaunchingDetails || (n?.props?.className && n.props.className.includes("ActionBar"));
              };

              // Find the parent container that holds the ActionBar
              const actionBarParent = findParentWithChild(ret, isActionBar);

              if (actionBarParent) {
                  // Find the specific child index
                  const children = actionBarParent.props.children;
                  const actionBarIndex = children.findIndex(isActionBar);
                  const actionBar = children[actionBarIndex];
                  
                  logger.info("Found Action Bar Parent. Action Bar is at index:", actionBarIndex);
                  // logger.info("Action Bar Props:", safeStringify(actionBar.props));

                  // Try to get AppID from the Action Bar's props (it has the overview)
                  let appId: number | undefined;
                  if (actionBar.props?.overview?.appid) {
                    appId = actionBar.props.overview.appid;
                  } else {
                      const match = window.location.pathname.match(/\/library\/app\/(\d+)/);
                      if (match) appId = parseInt(match[1]);
                  }

                   if (appId) {
                       const alreadyInjected = children.some((c: any) => c?.type === GameTrailer);
                       if (!alreadyInjected) {
                           logger.info(`Injecting GameTrailer button as sibling to Action Bar for AppID ${appId}`);
                           
                           // Insert AFTER the Action Bar
                           // We use splice to insert at specific index
                           children.splice(actionBarIndex + 1, 0, <GameTrailer appId={appId} />);
                       }
                       return ret;
                   } else {
                        logger.error("Found Action Bar but could not determine AppID", actionBar.props);
                   }
              } else {
                  // Fallback: Try strict Action Bar finding if parent search failed (legacy logic)
                  // But looking at previous logs, we know finding the *parent* is the key because the bar itself has no children.
                  logger.error("No parent container found for Action Bar in ret.");
                  
                  // Debug: what IS ret?
                  // logger.info("Ret structure:", safeStringify(ret));
              }

              return ret;
          });

          afterPatch(routeProps, "renderFunc", patchHandler);
          return tree;
      });
  } catch (e) {
      logger.error("Failed to create patch", e);
  }

  return {
    name: "Decky Trailers",
    title: <div>Decky Trailers</div>,
    content: <div>Native injection active.</div>,
    icon: <FaVideo />,
    onDismount() {
        if (patch) routerHook.removePatch("/library/app/:appid", patch);
    },
  };
});
