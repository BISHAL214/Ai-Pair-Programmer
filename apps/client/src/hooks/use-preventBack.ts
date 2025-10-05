import { useEffect } from "react";

export const usePreventBack = () => {
  return useEffect(() => {
    // 1. Add a new entry to the history stack
    window.history.pushState(null, "", window.location.href);

    // 2. Define the event handler for the 'popstate' event
    const handleBackButton = (event: PopStateEvent) => {
      // The popstate event is fired when the user navigates through history
      // We push them forward again, effectively canceling the back action
      window.history.pushState(null, "", window.location.href);
      // You could also use history.go(1);
    };

    // 3. Add the event listener when the component mounts
    window.addEventListener("popstate", handleBackButton);

    // 4. Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []); // The empty dependency array ensures this runs only once on mount
};
