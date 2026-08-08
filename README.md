# HFK 멤버 대쉬보드

Google Sheets(HFK사람들)에서 매번 최신 데이터를 fetch해 렌더링하는 정적 대쉬보드.
비밀번호로 시트 URL을 암호화(AES-GCM + PBKDF2)해서 embed하기 때문에,
비밀번호 없이는 시트에 접근할 수 없습니다.

## 사용

```bash
./deploy.sh
```

- 첫 실행: 비밀번호를 두 번 입력 (최소 6자). 암호화된 `index.html`이 생성되고 git push까지 자동으로 수행됩니다.
- 재실행 (콘텐츠 수정 후): 기존 비밀번호를 한 번 입력하고 커밋·푸시.
- 비밀번호를 바꾸려면 `rm index.html` 한 뒤 다시 실행.

## URL

Pages 반영까지 약 1분 소요:

```
https://thehfk.github.io/hfk-member-dashboard/
```

## 파일

- `template.html` — 소스. 암호화 placeholder(`__SALT__`, `__IV__`, `__CIPHERTEXT__`) 포함
- `build.mjs`     — Node 스크립트. 시트 ID+gid를 비밀번호로 암호화 후 index.html 생성
- `deploy.sh`     — 비밀번호 프롬프트 + build + git push
- `index.html`    — 배포되는 최종 파일 (커밋 대상)

## 보안 노트

- 비밀번호는 어디에도 저장되지 않습니다 (터미널 세션, 로그 모두 비어 있음).
- `index.html`은 공개 repo에 올라가지만, PBKDF2 300k iterations + AES-GCM으로 보호됩니다.
  브루트포스는 실질적으로 불가능하나 **비밀번호가 짧거나 사전에 있는 단어면 뚫릴 수 있음** — 12자 이상 랜덤 권장.
- 잘못된 비밀번호로 접근하면 복호화 실패 → 시트 URL을 알 수 없음.
- 세션 캐시: 올바른 비밀번호로 언락 후 sessionStorage에 URL 저장 (탭 닫으면 자동 삭제).
