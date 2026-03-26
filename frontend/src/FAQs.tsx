
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import MainLayout from "@/layouts/MainLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PointsContext {
  points_per_goal: number;
  points_per_assist: number;
  points_per_clean_sheet: number;
  points_per_penalty_save: number;
  points_per_penalty_miss: number;
  points_per_yellow_card: number;
  points_per_red_card: number;
  points_per_own_goal: number;
  points_per_2_goals_conceded: number;
  points_per_man_of_the_match: number;
}

interface PointsSystem {
  forward: PointsContext;
  midfielder: PointsContext;
  defender: PointsContext;
  goalkeeper: PointsContext;
}

interface FAQsApiResponse {
  points_system: PointsSystem;
}

const fetchFaqs = async (): Promise<FAQsApiResponse> => {
  const response = await axios.get("/api/faqs/");
  return response.data;
};

const PointsTable = ({ data }: { data: PointsContext | undefined }) => {
  if (!data) return null;

  const pointsMap = [
    { label: "Every goal scored", value: data.points_per_goal },
    { label: "Every assist", value: data.points_per_assist },
    { label: "Every clean sheet", value: data.points_per_clean_sheet },
    { label: "Every penalty save", value: data.points_per_penalty_save },
    { label: "Every penalty miss", value: data.points_per_penalty_miss },
    { label: "Every yellow card", value: data.points_per_yellow_card },
    { label: "Every red card", value: data.points_per_red_card },
    { label: "Every own goal", value: data.points_per_own_goal },
    { label: "Every 2 goals conceded", value: data.points_per_2_goals_conceded },
    { label: "Every Man of the Match", value: data.points_per_man_of_the_match },
  ];

  return (
    <div className="overflow-x-auto rounded-md border mt-2">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted text-muted-foreground border-b">
          <tr>
            <th className="px-4 py-2 font-medium">Action</th>
            <th className="px-4 py-2 font-medium text-right">Points</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {pointsMap.map((item, idx) => (
            <tr key={idx} className="hover:bg-muted/50 transition-colors">
              <td className="px-4 py-2">{item.label}</td>
              <td className="px-4 py-2 text-right">
                <span
                  className={
                    item.value > 0
                      ? "text-green-600 font-medium"
                      : item.value < 0
                        ? "text-red-600 font-medium"
                        : "text-muted-foreground"
                  }
                >
                  {item.value > 0 ? `+${item.value}` : item.value}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function FAQs() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["faqs"],
    queryFn: fetchFaqs,
  });

  return (
    <MainLayout>
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">FAQs</h1>
          <p className="text-muted-foreground">
            Learn more about how BalonRank works and how players are scored.
          </p>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading FAQs...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-500 bg-red-50 rounded-lg p-4">
            <p>Error loading FAQs: {error instanceof Error ? error.message : "Unknown error"}</p>
          </div>
        )}

        {data && (
          <section id="points-system" className="space-y-6">
            <h2 className="text-2xl font-semibold border-b pb-2">Points System</h2>
            <p className="text-muted-foreground">
              Points are awarded differently depending on the player's position. Check the criteria below.
            </p>
            <Accordion type="single" collapsible className="w-full border rounded-lg px-4 bg-card">
              <AccordionItem value="forward">
                <AccordionTrigger className="hover:no-underline font-semibold text-lg">
                  Forward (Striker or Winger)
                </AccordionTrigger>
                <AccordionContent>
                  <PointsTable data={data.points_system.forward} />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="midfielder">
                <AccordionTrigger className="hover:no-underline font-semibold text-lg">
                  Midfielder
                </AccordionTrigger>
                <AccordionContent>
                  <PointsTable data={data.points_system.midfielder} />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="defender">
                <AccordionTrigger className="hover:no-underline font-semibold text-lg">
                  Defender
                </AccordionTrigger>
                <AccordionContent>
                  <PointsTable data={data.points_system.defender} />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="goalkeeper" className="border-b-0">
                <AccordionTrigger className="hover:no-underline font-semibold text-lg">
                  Goalkeeper
                </AccordionTrigger>
                <AccordionContent>
                  <PointsTable data={data.points_system.goalkeeper} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        )}
      </div>
    </MainLayout>
  );
}

export default FAQs;
