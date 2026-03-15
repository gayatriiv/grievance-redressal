import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const communityGrievanceListInclude = {
  student: {
    select: {
      id: true,
      department: true,
    },
  },
  votes: {
    select: {
      userId: true,
      value: true,
    },
  },
  follows: {
    select: {
      userId: true,
    },
  },
  comments: {
    select: {
      id: true,
    },
  },
} satisfies Prisma.GrievanceInclude;

const communityGrievanceDetailInclude = {
  student: {
    select: {
      id: true,
      department: true,
    },
  },
  votes: {
    select: {
      userId: true,
      value: true,
    },
  },
  follows: {
    select: {
      userId: true,
    },
  },
  comments: {
    orderBy: { createdAt: "desc" as const },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          department: true,
          role: true,
        },
      },
    },
  },
} satisfies Prisma.GrievanceInclude;

type CommunityGrievanceListRecord = Prisma.GrievanceGetPayload<{ include: typeof communityGrievanceListInclude }>;
type CommunityGrievanceDetailRecord = Prisma.GrievanceGetPayload<{ include: typeof communityGrievanceDetailInclude }>;

type CommunityGrievanceSort = "hot" | "recent";

const serializeSupport = (
  grievance: Pick<CommunityGrievanceListRecord, "votes" | "follows" | "comments">,
  viewerId: string
) => {
  const upvotes = grievance.votes.filter((vote) => vote.value > 0).length;
  const downvotes = grievance.votes.filter((vote) => vote.value < 0).length;
  const currentUserVote = grievance.votes.find((vote) => vote.userId === viewerId)?.value ?? 0;
  const isFollowing = grievance.follows.some((follow) => follow.userId === viewerId);

  return {
    upvotes,
    downvotes,
    score: upvotes - downvotes,
    followerCount: grievance.follows.length,
    commentCount: grievance.comments.length,
    currentUserVote,
    isFollowing,
  };
};

const serializeCommunityGrievance = (grievance: CommunityGrievanceListRecord, viewerId: string) => {
  const support = serializeSupport(grievance, viewerId);

  return {
    id: grievance.id,
    title: grievance.title,
    description: grievance.description,
    summary: grievance.summary,
    category: grievance.category,
    status: grievance.status,
    urgency: grievance.urgency,
    departmentAssigned: grievance.departmentAssigned,
    reporterDepartment: grievance.student.department,
    createdAt: grievance.createdAt.toISOString(),
    updatedAt: grievance.updatedAt.toISOString(),
    ...support,
  };
};

const compareHot = (
  left: ReturnType<typeof serializeCommunityGrievance>,
  right: ReturnType<typeof serializeCommunityGrievance>
) => {
  const leftScore = left.score * 3 + left.followerCount * 2 + left.commentCount;
  const rightScore = right.score * 3 + right.followerCount * 2 + right.commentCount;

  if (leftScore !== rightScore) {
    return rightScore - leftScore;
  }

  return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
};

export const getCommunityGrievances = async ({
  viewerId,
  category,
  sort = "hot",
}: {
  viewerId: string;
  category?: string;
  sort?: CommunityGrievanceSort;
}) => {
  const grievances = await prisma.grievance.findMany({
    where: {
      isAnonymous: false,
      ...(category ? { category } : {}),
    },
    include: communityGrievanceListInclude,
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  const serialized = grievances.map((grievance) => serializeCommunityGrievance(grievance, viewerId));
  if (sort === "recent") {
    return serialized;
  }

  return [...serialized].sort(compareHot);
};

export const getCommunityGrievanceById = async (grievanceId: string, viewerId: string) => {
  const grievance = await prisma.grievance.findFirst({
    where: {
      id: grievanceId,
      isAnonymous: false,
    },
    include: communityGrievanceDetailInclude,
  });

  if (!grievance) {
    return null;
  }

  return {
    ...serializeCommunityGrievance(grievance, viewerId),
    comments: grievance.comments.map((comment) => ({
      id: comment.id,
      message: comment.message,
      createdAt: comment.createdAt.toISOString(),
      user: {
        id: comment.user.id,
        name: comment.user.name,
        department: comment.user.department,
        role: comment.user.role,
      },
    })),
  };
};

export const ensureCommunityGrievance = async (grievanceId: string) => {
  return prisma.grievance.findFirst({
    where: {
      id: grievanceId,
      isAnonymous: false,
    },
    select: {
      id: true,
    },
  });
};