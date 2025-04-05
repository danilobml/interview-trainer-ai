import Agent from "@/components/Agent";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getInterviewById } from "@/lib/actions/general.actions";

const InterviewGeneration  = async ({params}: RouteParams) => {
  const { id } = await params;

  let type: "generate" | "interview" | "retake";

  const user = await getCurrentUser();
  const interview = await getInterviewById(id);

  if(interview?.finalized) {
    type = "retake"
  } else {
    type = "generate"
  }

  return (
    <>
        <h3>Interview Generation</h3>
        <Agent userName={user?.name!} userId={user?.id} type={type} />
    </>
  )
}

export default InterviewGeneration;