/**
 * Comment JSON format, used to communicate between client and server.
 */
export interface CommentFormat {
    id: number;
    userID: number;
    displayName: string;
    timePosted: Date;
    content: string;
}
