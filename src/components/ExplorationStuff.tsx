import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useExploratoryStore } from "@/store/useExploratoryStore";
import { MountainIcon, StarsIcon } from "lucide-react";

export const ExplorationStuff = () => {
  const activateIdeaSelection = useExploratoryStore(
    (state) => state.activateIdeaSelection
  );
  const requestSuggestion = useExploratoryStore(
    (state) => state.requestSuggestion
  );
  const events = useExploratoryStore((state) => state.events);

  return (
    <Dialog>
      <DialogTrigger>
        <StarsIcon />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Data Exploration</DialogTitle>
          <DialogDescription>
            This controls allow you to highlight certain parts and share your
            domain expert knowledge with a LLM in order to help you to construct
            a hypthesis about your data.
          </DialogDescription>
        </DialogHeader>
        <div className="my-2">
          You already collected {events.length} Events.
        </div>
        <DialogFooter>
          <DialogClose>
            <Button
              variant={"secondary"}
              onClick={() => activateIdeaSelection()}
            >
              <MountainIcon className="mr-2" /> Highlight Data
            </Button>
          </DialogClose>
          <Button
            variant={"secondary"}
            disabled={!events.length}
            onClick={() => requestSuggestion()}
          >
            <StarsIcon className="mr-2" /> Generate Hypothesis
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
