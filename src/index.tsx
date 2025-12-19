import { definePlugin, routerHook } from "@decky/api";
import { afterPatch, findInReactTree, appDetailsClasses, createReactTreePatcher, Focusable } from "@decky/ui";
import { FaVideo } from "react-icons/fa";
import * as React from "react";
import { ReactElement } from "react";
import { GameTrailer } from "./components/GameTrailer";

// @ts-ignore
const logger = {
    info: (...args: any[]) => console.log("%c Decky Trailers %c Info %c", "background: #16a085; color: black;", "background: #1abc9c; color: black;", "background: transparent;", ...args),
    error: (...args: any[]) => console.error("%c Decky Trailers %c Error %c", "background: #c0392b; color: white;", "background: #e74c3c; color: white;", "background: transparent;", ...args),
};

function dumpTree(node: any, depth: number = 0) {
    if (depth > 5 || !node) return;
    const indent = "  ".repeat(depth);
    const type = node.type?.displayName || node.type?.name || (typeof node.type === "string" ? node.type : "[object]");
    const props = node.props ? Object.keys(node.props) : [];
    const classes = node.props?.className || "";
    logger.info(`${indent}- Type: ${type}, Class: ${classes}, Props: [${props.join(', ')}]`);

    const children = node.props?.children;
    if (children) {
        if (Array.isArray(children)) {
            children.forEach(c => dumpTree(c, depth + 1));
        } else {
            dumpTree(children, depth + 1);
        }
    }
}

export default definePlugin(() => {
  logger.info("Initializing Decky Trailers v0.1.11 (Video Fallback & Tree Dump)...");

  let patch: any;

  try {
      patch = routerHook.addPatch("/library/app/:appid", (tree: any) => {
          const routeProps = findInReactTree(tree, (x: any) => x?.renderFunc);
          
          if (!routeProps) {
              return tree;
          }

          const patchHandler = createReactTreePatcher([
              (tree: any) => findInReactTree(tree, (x: any) => x?.props?.children?.props?.overview)?.props?.children
          ], (_: any[], ret: ReactElement) => {
              
              logger.info("--- Tree Dump for Button Placement ---");
              try {
                dumpTree(ret, 0);
              } catch (e) {
                logger.error("Tree dump failed", e);
              }
              logger.info("--- End Tree Dump ---");

              let appId: number | undefined;
              const overviewProps = findInReactTree(ret, (x: any) => x?.props?.appid); 
              if (overviewProps?.props?.appid) {
                  appId = overviewProps.props.appid;
              } else {
                  const match = window.location.pathname.match(/\/library\/app\/(\d+)/);
                  if (match) appId = parseInt(match[1]);
              }

              if (!appId) {
                   return ret;
              }

              // Re-injecting the GameTrailer temporarily to test the video fallback.
              // We will adjust the injection point after analyzing the tree dump.
              const container = findInReactTree(ret, (x: any) => 
                  x?.props?.className?.includes(appDetailsClasses.InnerContainer)
              );

              if (!container || !container.props || !Array.isArray(container.props.children)) {
                  logger.info("InnerContainer not found or invalid in patcher ret");
                  return ret;
              }

              const alreadyInjected = container.props.children.some((c: any) => c?.type === GameTrailer);
              if (alreadyInjected) return ret;

              logger.info(`Injecting GameTrailer for AppID ${appId}`);

              container.props.children.splice(1, 0, <GameTrailer appId={appId} />);
              
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