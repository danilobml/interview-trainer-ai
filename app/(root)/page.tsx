import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import InterviewCard from "@/components/InterviewCard"
import { getCurrentUser } from "@/lib/actions/auth.actions"
import { getInterviewsByUserId, getLatestInterviews } from "@/lib/actions/general.actions"

const HomePage = async () => {
  const user = await getCurrentUser();

  const [userInterviews, latestInterviews] = await Promise.all([
    await getInterviewsByUserId(user?.id!),
    await getLatestInterviews({ userId: user?.id! })
  ]);

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className="text-lg">
            Practice on real interview questions & get instant feedback
          </p>
          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>
        <Image src="/robot.png" alt="robot" width={400} height={400} className="max-sm:hidden" />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews:</h2>
        <div className="interviews-section">
          {!userInterviews?.length ? (<p>You haven&apos;t taken any interviews yet.</p>) : (
            userInterviews.map(interview => (
              <InterviewCard {...interview} key={interview.id} />
            )))
          }
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Take an Interview:</h2>
        <div className="interviews-section">
          {!latestInterviews?.length ? (<p>There are no interviews available.</p>) : (
            latestInterviews.map(interview => (
              <InterviewCard {...interview} key={interview.id} />
            )))
          }
        </div>
      </section>
    </>
  )
}

export default HomePage