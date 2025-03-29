import { API_URL } from "@/config/constants";
import { ContentSection, ContentType, ContentStatus } from "./cms";

export interface TeamMember {
    id: number;
    contentKey: string;
    title: string; // Name of team member
    description: string; // Role/Position
    imageUrl: string; // Profile photo
    displayOrder: number;
}

/**
 * Fetch all team members from CMS
 */
export async function getTeamMembers(): Promise<TeamMember[]> {
    try {
        // Fetch team members from CMS API with proper filtering
        const response = await fetch(
            `${API_URL}/cms?contentType=${ContentType.TEAM_MEMBER}&section=${ContentSection.ABOUT}&status=${ContentStatus.ACTIVE}`,
        );

        if (!response.ok) {
            throw new Error(`Error fetching team members: ${response.status}`);
        }

        const data = await response.json();

        // Sort by display order
        return data.sort(
            (a: TeamMember, b: TeamMember) => a.displayOrder - b.displayOrder,
        );
    } catch (error) {
        console.error("Error fetching team members:", error);
        // Return empty array in case of error
        return [];
    }
}
