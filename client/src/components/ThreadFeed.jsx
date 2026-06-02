/* eslint-disable react/prop-types */
import React from "react";
import AddMsg from "./AddMsg";
import ThreadCard from "./ThreadCard";

function ThreadFeed({
    currentView,
    handleCreateThread,
    sortBy,
    setSortBy,
    filteredAndSortedThreads,
    user,
    usersList,
    setSelectedProfile,
    setCurrentView,
    activeThreadReplyId,
    setActiveThreadReplyId,
    likedThreads,
    handleLike,
    handleDeleteThread,
    handleCreateReply,
    handleDeleteReply
}) {
    return (
        <>
            {currentView !== "likes" && (
                <div id="new_comment" className="forum-editor-box">
                    <AddMsg write={handleCreateThread} forum={currentView} isReply={false} />
                </div>
            )}

            <div className="forum-sort-bar">
                <button className={sortBy === "date" ? "active" : ""} onClick={() => setSortBy("date")}>Récents</button>
                <button className={sortBy === "popularity" ? "active" : ""} onClick={() => setSortBy("popularity")}>Popularité</button>
            </div>

            <article className="forum-threads-article">
                <ul className="forum-cards-list">
                    {filteredAndSortedThreads.map((thread) => (
                        <ThreadCard
                            key={thread._id}
                            thread={thread}
                            user={user}
                            usersList={usersList}
                            setSelectedProfile={setSelectedProfile}
                            setCurrentView={setCurrentView}
                            activeThreadReplyId={activeThreadReplyId}
                            setActiveThreadReplyId={setActiveThreadReplyId}
                            likedThreads={likedThreads}
                            handleLike={handleLike}
                            handleDeleteThread={handleDeleteThread}
                            handleCreateReply={handleCreateReply}
                            handleDeleteReply={handleDeleteReply}
                        />
                    ))}
                </ul>
            </article>
        </>
    );
}

export default ThreadFeed;