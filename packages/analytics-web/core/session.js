export function getSessionId() {
    let sid = sessionStorage.getItem('analytics_session_id');
    if (!sid) {
        sid = `sess_${Math.random().toString(36).substring(2, 15)}`;
        sessionStorage.setItem('analytics_session_id', sid);
    }
    return sid;
}

