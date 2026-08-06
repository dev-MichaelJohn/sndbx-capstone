import {
  useRecentAnonymousSubmissions,
  useEvaluationSocket,
} from "../api/evaluation-execution.service";
import { Card, CardContent } from "@/components/ui/card";
import { LiveFeedHeader } from "./LiveFeedHeader";
import { SubmissionFeedItem } from "./SubmissionFeedItem";
import { SubmissionFeedEmptyState } from "./SubmissionFeedEmptyState";

export const LiveSubmissionsWidget = () => {
  useEvaluationSocket();
  const { data: submissions = [], isLoading, isError } = useRecentAnonymousSubmissions();

  return (
    <Card className="rounded-xl border shadow-xs flex flex-col">
      <LiveFeedHeader />

      <CardContent className="p-4 flex-1">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-xs text-muted-foreground">
            Connecting to submission stream…
          </div>
        ) : isError ? (
          <div className="flex h-64 items-center justify-center text-xs text-destructive">
            Failed to connect to live activity feed.
          </div>
        ) : submissions.length === 0 ? (
          <SubmissionFeedEmptyState />
        ) : (
          <div className="space-y-2">
            {submissions.map((item) => (
              <SubmissionFeedItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
