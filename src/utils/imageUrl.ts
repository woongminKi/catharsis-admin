// 프론트(catharsis-frontend)의 public/images 기준 절대 URL
// admin은 자체 이미지 번들이 없어서 옛 이미지를 프론트 도메인으로 우회시킴
const FRONTEND_BASE = process.env.REACT_APP_FRONTEND_URL || 'https://www.catharsisact.com';

// AWS 계정 정지로 죽은 옛 S3 버킷 prefix들
// DB에 박힌 옛 URL을 프론트의 /images로 우회시키기 위한 매핑
const LEGACY_S3_PREFIXES = [
  'https://catharsis-image.s3.ap-northeast-2.amazonaws.com',
  'http://catharsis-image.s3.ap-northeast-2.amazonaws.com',
];

/**
 * URL의 path 부분을 NFD → NFC 정규화.
 * Mac에서 S3로 업로드한 한글 키는 NFD인데 Vercel CDN은 NFC 매칭이라 둘이 안 맞음.
 * decode → normalize('NFC') → encode 로 변환.
 */
const normalizePathToNFC = (path: string): string => {
  try {
    const decoded = decodeURIComponent(path);
    const nfc = decoded.normalize('NFC');
    // encodeURI는 path 구분자(/)를 유지하면서 인코딩
    return encodeURI(nfc);
  } catch {
    return path;
  }
};

/**
 * 옛 S3 URL을 프론트의 /images로 우회시킴.
 * - 옛 S3 URL이면 NFC 정규화해서 프론트 절대 URL로 변환
 * - R2 URL이나 상대경로는 그대로 통과
 */
export const rewriteImageUrl = (url?: string | null): string => {
  if (!url) return '';
  for (const prefix of LEGACY_S3_PREFIXES) {
    if (url.startsWith(prefix)) {
      return FRONTEND_BASE + '/images' + normalizePathToNFC(url.slice(prefix.length));
    }
  }
  return url;
};

/**
 * Quill HTML 본문 안의 옛 S3 URL을 일괄 치환
 */
export const rewriteImagesInHtml = (html?: string | null): string => {
  if (!html) return '';
  // 옛 S3 URL을 모두 찾아서 각각 NFC 정규화 (단순 split.join은 인코딩 정규화 못 함)
  let result = html;
  for (const prefix of LEGACY_S3_PREFIXES) {
    const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped + '([^"\'\\s)<>]*)', 'g');
    result = result.replace(regex, (_match, path) => FRONTEND_BASE + '/images' + normalizePathToNFC(path));
  }
  return result;
};
