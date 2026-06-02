/* eslint-disable react/prop-types */
import React from "react";

function UserFriends({ friends }) {
    return (
        <div className="forum-thread-card" style={{ padding: "25px" }}>
            <h2>👥 Membres suivis ({friends.length})</h2>
            <ul>
                {friends.map((f, i) => (
                    <li key={i}>
                        @{typeof f === 'object' ? f.friendPseudo : f}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default UserFriends;