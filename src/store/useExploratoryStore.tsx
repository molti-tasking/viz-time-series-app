import { create } from "zustand";

import { Input } from "@/components/ui/input";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/hooks/use-toast";
import { ChartPresentationSettings } from "@/lib/ChartPresentationSettings";
import { useState } from "react";

type ExplorationEvent = {
  userMessage?: string | undefined;
  systemMessage?: string | undefined;
  payload: object;
};

interface DataStore {
  events: ExplorationEvent[];
  suggestion: string | undefined;
  isSelecting: boolean;

  activateIdeaSelection: () => void;
  addSettingUpdateEvent: (
    pastSettings: ChartPresentationSettings,
    newSettings: ChartPresentationSettings
  ) => void;
  addDataIdeaEvent: (payload: object) => void;

  requestSuggestion: () => void;
}

const FeedbackForm = ({
  onSubmitFeedback,
}: {
  onSubmitFeedback: (positive: boolean, text: string) => void;
}) => {
  const [feedback, setFeedback] = useState<string>("");

  return (
    <div>
      <div className="max-w-sm">
        <Input
          type="search"
          id="clusterAssignmentHistoryDepth"
          placeholder="Your feedback... (optional)"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </div>
      <ToastAction
        onClick={() => onSubmitFeedback(true, feedback)}
        altText="Good"
      >
        Good
      </ToastAction>

      <ToastAction
        onClick={() => onSubmitFeedback(false, feedback)}
        altText="Bad"
      >
        Bad
      </ToastAction>
    </div>
  );
};

export const useExploratoryStore = create<DataStore>((set, get) => {
  console.log("init exploratory store");

  const requestSettingUpdateFeedback = () => {
    const onSubmitFeedback = (positive: boolean, text: string) => {
      const currentEvents = get().events;
      const newUserEvents: ExplorationEvent[] = [
        ...currentEvents,
        {
          systemMessage: `The user rated the last settings update ${
            positive ? "positively" : "negatively"
          }${!!text?.length ? `: ${text}` : "."}`,
          payload: {},
        },
      ];
      set({ events: newUserEvents });
    };

    toast({
      title: "Uh oh! Something went wrong.",
      description: "There was a problem with your request.",
      action: <FeedbackForm onSubmitFeedback={onSubmitFeedback} />,
    });
  };

  const addSettingUpdateEvent = async (
    pastSettings: ChartPresentationSettings,
    newSettings: ChartPresentationSettings
  ) => {
    const timeout = setTimeout(() => {
      console.log("Now get feedback :)");
      requestSettingUpdateFeedback();
    }, 5000);
    console.log("Updated settings, timeout: ", timeout);
    const currentEvents = get().events;
    const newUserEvents: ExplorationEvent[] = [
      ...currentEvents,
      {
        systemMessage: "The user updated the settings.",
        payload: { pastSettings, newSettings },
      },
    ];

    set({ events: newUserEvents });
  };

  const activateIdeaSelection = () => {
    set({ isSelecting: true });
  };

  const addDataIdeaEvent = (payload: object) => {
    set({ isSelecting: false });

    const feedback = prompt(
      "Please enter your thoughts on your selected graph",
      "This data visualization is interesting, because..."
    );

    const newEvent: ExplorationEvent = {
      systemMessage: `The user gave feedback "${feedback}" to a data visualisation of the data in the payload.`,
      payload,
    };

    const currentEvents = get().events;
    const newUserEvents: ExplorationEvent[] = [...currentEvents, newEvent];
    set({ events: newUserEvents });
  };

  const requestSuggestion = () => {
    alert("This says the AI: What's up?");
  };

  return {
    events: [],
    suggestion: undefined,
    isSelecting: false,

    activateIdeaSelection,
    addDataIdeaEvent,
    addSettingUpdateEvent,
    requestSuggestion,
  };
});
