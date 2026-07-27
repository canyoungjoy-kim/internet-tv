/* ═══════════════════════════════════════════════════════════
   Firebase 접속 설정 — 관리자 앱과 입주민 예약 페이지가 같이 씁니다.

   ▶ 하는 일
     아래 { } 안을 Firebase 콘솔에서 복사한 firebaseConfig 로 바꿔서
     GitHub에 올리면(커밋) 예약 페이지가 동작합니다.

   ▶ Firebase 콘솔 → 프로젝트 설정 → 내 앱 → 웹 앱 → firebaseConfig 복사

   ▶ 이 값은 비밀이 아닙니다.
     Firebase 웹 설정은 원래 브라우저에 공개되는 값이고, 실제 보안은
     Firestore "규칙"이 담당합니다. 관리자 앱 설정 화면의 규칙을
     반드시 먼저 적용하세요.
   ═══════════════════════════════════════════════════════════ */

window.ITTV_FIREBASE_CONFIG = {
  apiKey:            "",
  authDomain:        "",
  projectId:         "",
  storageBucket:     "",
  messagingSenderId: "",
  appId:             ""
};
