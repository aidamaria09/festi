import { ForumBoard } from "../components/ForumBoard";
import "./ForumPage.css";

export function ForumPage() {
  return (
    <div className="container forum-page">
      <h2 className="section-title">Forum</h2>
      <ForumBoard />
    </div>
  );
}
