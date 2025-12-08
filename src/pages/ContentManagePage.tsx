import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { adminContentAPI, imageAPI } from '../utils/api';

type TabType = 'hero' | 'schoolPassers' | 'youtube' | 'instructors' | 'instagram';

interface HeroSection {
  imageUrl: string;
  subtitle: string;
  title: string;
  buttonText: string;
  buttonLink: string;
}

interface SchoolPasser {
  _id?: string;
  thumbnailUrl: string;
  school: string;
  count: number;
  link: string;
  order: number;
}

interface YoutubeVideo {
  _id?: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  link: string;
  order: number;
}

interface Instructor {
  _id?: string;
  imageUrl: string;
  name: string;
  description: string;
  link: string;
  order: number;
}

interface InstagramPost {
  _id?: string;
  imageUrl: string;
  title: string;
  link: string;
  order: number;
}

const ContentManagePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 히어로 섹션
  const [heroSection, setHeroSection] = useState<HeroSection>({
    imageUrl: '',
    subtitle: '',
    title: '',
    buttonText: '',
    buttonLink: '',
  });

  // 학교별 합격자
  const [schoolPassers, setSchoolPassers] = useState<SchoolPasser[]>([]);

  // 유튜브 영상
  const [youtubeVideos, setYoutubeVideos] = useState<YoutubeVideo[]>([]);

  // 강사진
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  // 인스타그램
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);

  const heroImageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await adminContentAPI.getAll();
      const data = response.data.data;

      setHeroSection(data.heroSection || {
        imageUrl: '',
        subtitle: 'MAKE YOUR STYLE',
        title: '입시를 스타일하다, 민액터스',
        buttonText: '2024 합격자 전체보기',
        buttonLink: '/passers',
      });
      setSchoolPassers(data.schoolPassers || []);
      setYoutubeVideos(data.youtubeVideos || []);
      setInstructors(data.instructors || []);
      setInstagramPosts(data.instagramPosts || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      alert('콘텐츠를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 히어로 섹션 저장
  const handleSaveHero = async () => {
    try {
      setSaving(true);
      await adminContentAPI.updateHero(heroSection);
      alert('저장되었습니다.');
    } catch (error) {
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 히어로 이미지 업로드
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await imageAPI.upload(file, 'content/hero');
      setHeroSection({ ...heroSection, imageUrl: response.data.data.url });
    } catch (error) {
      alert('이미지 업로드에 실패했습니다.');
    }
  };

  // 학교별 합격자 저장
  const handleSaveSchoolPassers = async () => {
    try {
      setSaving(true);
      await adminContentAPI.updateSchoolPassers(schoolPassers);
      alert('저장되었습니다.');
    } catch (error) {
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 학교 추가
  const handleAddSchool = () => {
    setSchoolPassers([
      ...schoolPassers,
      { thumbnailUrl: '', school: '', count: 0, link: '', order: schoolPassers.length },
    ]);
  };

  // 학교 삭제
  const handleRemoveSchool = (index: number) => {
    setSchoolPassers(schoolPassers.filter((_, i) => i !== index));
  };

  // 학교 썸네일 업로드
  const handleSchoolThumbnailUpload = async (index: number, file: File) => {
    try {
      const response = await imageAPI.upload(file, 'content/schools');
      const updated = [...schoolPassers];
      updated[index].thumbnailUrl = response.data.data.url;
      setSchoolPassers(updated);
    } catch (error) {
      alert('이미지 업로드에 실패했습니다.');
    }
  };

  // 유튜브 영상 저장
  const handleSaveYoutube = async () => {
    try {
      setSaving(true);
      await adminContentAPI.updateYoutubeVideos(youtubeVideos);
      alert('저장되었습니다.');
    } catch (error) {
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 유튜브 추가
  const handleAddYoutube = () => {
    setYoutubeVideos([
      ...youtubeVideos,
      { thumbnailUrl: '', title: '', description: '', link: '', order: youtubeVideos.length },
    ]);
  };

  // 유튜브 삭제
  const handleRemoveYoutube = (index: number) => {
    setYoutubeVideos(youtubeVideos.filter((_, i) => i !== index));
  };

  // 유튜브 썸네일 업로드
  const handleYoutubeThumbnailUpload = async (index: number, file: File) => {
    try {
      const response = await imageAPI.upload(file, 'content/youtube');
      const updated = [...youtubeVideos];
      updated[index].thumbnailUrl = response.data.data.url;
      setYoutubeVideos(updated);
    } catch (error) {
      alert('이미지 업로드에 실패했습니다.');
    }
  };

  // 강사진 저장
  const handleSaveInstructors = async () => {
    try {
      setSaving(true);
      await adminContentAPI.updateInstructors(instructors);
      alert('저장되었습니다.');
    } catch (error) {
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 강사 추가
  const handleAddInstructor = () => {
    setInstructors([
      ...instructors,
      { imageUrl: '', name: '', description: '', link: '', order: instructors.length },
    ]);
  };

  // 강사 삭제
  const handleRemoveInstructor = (index: number) => {
    setInstructors(instructors.filter((_, i) => i !== index));
  };

  // 강사 이미지 업로드
  const handleInstructorImageUpload = async (index: number, file: File) => {
    try {
      const response = await imageAPI.upload(file, 'content/instructors');
      const updated = [...instructors];
      updated[index].imageUrl = response.data.data.url;
      setInstructors(updated);
    } catch (error) {
      alert('이미지 업로드에 실패했습니다.');
    }
  };

  // 인스타그램 저장
  const handleSaveInstagram = async () => {
    try {
      setSaving(true);
      await adminContentAPI.updateInstagramPosts(instagramPosts);
      alert('저장되었습니다.');
    } catch (error) {
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 인스타 추가
  const handleAddInstagram = () => {
    setInstagramPosts([
      ...instagramPosts,
      { imageUrl: '', title: '', link: '', order: instagramPosts.length },
    ]);
  };

  // 인스타 삭제
  const handleRemoveInstagram = (index: number) => {
    setInstagramPosts(instagramPosts.filter((_, i) => i !== index));
  };

  // 인스타 이미지 업로드
  const handleInstagramImageUpload = async (index: number, file: File) => {
    try {
      const response = await imageAPI.upload(file, 'content/instagram');
      const updated = [...instagramPosts];
      updated[index].imageUrl = response.data.data.url;
      setInstagramPosts(updated);
    } catch (error) {
      alert('이미지 업로드에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <Container>
        <PageTitle>컨텐츠 관리</PageTitle>
        <LoadingText>로딩 중...</LoadingText>
      </Container>
    );
  }

  return (
    <Container>
      <PageTitle>컨텐츠 관리</PageTitle>

      <TabContainer>
        <Tab $active={activeTab === 'hero'} onClick={() => setActiveTab('hero')}>
          메인 홈 이미지
        </Tab>
        <Tab $active={activeTab === 'schoolPassers'} onClick={() => setActiveTab('schoolPassers')}>
          학교별 합격자
        </Tab>
        <Tab $active={activeTab === 'youtube'} onClick={() => setActiveTab('youtube')}>
          유튜브 영상
        </Tab>
        <Tab $active={activeTab === 'instructors'} onClick={() => setActiveTab('instructors')}>
          강사진
        </Tab>
        <Tab $active={activeTab === 'instagram'} onClick={() => setActiveTab('instagram')}>
          학원 인스타 썸네일
        </Tab>
      </TabContainer>

      <ContentBox>
        {/* 메인 홈 이미지 탭 */}
        {activeTab === 'hero' && (
          <>
            <SectionTitle>메인 홈 이미지 설정</SectionTitle>
            <FormRow>
              <FormLabel>배경 이미지</FormLabel>
              <input
                type="file"
                ref={heroImageRef}
                onChange={handleHeroImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <UploadButton onClick={() => heroImageRef.current?.click()}>
                이미지 선택
              </UploadButton>
              {heroSection.imageUrl && (
                <ImagePreview>
                  <img src={heroSection.imageUrl} alt="히어로 이미지" />
                  <RemoveButton onClick={() => setHeroSection({ ...heroSection, imageUrl: '' })}>
                    삭제
                  </RemoveButton>
                </ImagePreview>
              )}
            </FormRow>
            <FormRow>
              <FormLabel>서브 타이틀</FormLabel>
              <Input
                value={heroSection.subtitle}
                onChange={(e) => setHeroSection({ ...heroSection, subtitle: e.target.value })}
                placeholder="예: MAKE YOUR STYLE"
              />
            </FormRow>
            <FormRow>
              <FormLabel>메인 타이틀</FormLabel>
              <Input
                value={heroSection.title}
                onChange={(e) => setHeroSection({ ...heroSection, title: e.target.value })}
                placeholder="예: 입시를 스타일하다, 민액터스"
              />
            </FormRow>
            <FormRow>
              <FormLabel>버튼 텍스트</FormLabel>
              <Input
                value={heroSection.buttonText}
                onChange={(e) => setHeroSection({ ...heroSection, buttonText: e.target.value })}
                placeholder="예: 2024 합격자 전체보기"
              />
            </FormRow>
            <FormRow>
              <FormLabel>버튼 링크</FormLabel>
              <Input
                value={heroSection.buttonLink}
                onChange={(e) => setHeroSection({ ...heroSection, buttonLink: e.target.value })}
                placeholder="예: /passers"
              />
            </FormRow>
            <SaveButtonContainer>
              <SaveButton onClick={handleSaveHero} disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </SaveButton>
            </SaveButtonContainer>
          </>
        )}

        {/* 학교별 합격자 탭 */}
        {activeTab === 'schoolPassers' && (
          <>
            <SectionHeader>
              <SectionTitle>학교별 합격자 설정</SectionTitle>
              <AddButton onClick={handleAddSchool}>+ 학교 추가</AddButton>
            </SectionHeader>
            {schoolPassers.map((school, index) => (
              <ItemCard key={index}>
                <ItemHeader>
                  <ItemTitle>학교 {index + 1}</ItemTitle>
                  <DeleteButton onClick={() => handleRemoveSchool(index)}>삭제</DeleteButton>
                </ItemHeader>
                <FormRow>
                  <FormLabel>썸네일 이미지</FormLabel>
                  <input
                    type="file"
                    onChange={(e) => e.target.files?.[0] && handleSchoolThumbnailUpload(index, e.target.files[0])}
                    accept="image/*"
                    style={{ display: 'none' }}
                    id={`school-thumb-${index}`}
                  />
                  <UploadButton onClick={() => document.getElementById(`school-thumb-${index}`)?.click()}>
                    이미지 선택
                  </UploadButton>
                  {school.thumbnailUrl && (
                    <SmallImagePreview src={school.thumbnailUrl} alt="썸네일" />
                  )}
                </FormRow>
                <FormRow>
                  <FormLabel>학교명</FormLabel>
                  <Input
                    value={school.school}
                    onChange={(e) => {
                      const updated = [...schoolPassers];
                      updated[index].school = e.target.value;
                      setSchoolPassers(updated);
                    }}
                    placeholder="예: 한국예술종합학교"
                  />
                </FormRow>
                <FormRow>
                  <FormLabel>합격자 수</FormLabel>
                  <Input
                    type="number"
                    min="0"
                    value={school.count === 0 ? '' : school.count}
                    onChange={(e) => {
                      const updated = [...schoolPassers];
                      const value = e.target.value;
                      updated[index].count = value === '' ? 0 : Number(value);
                      setSchoolPassers(updated);
                    }}
                    placeholder="0"
                  />
                </FormRow>
                <FormRow>
                  <FormLabel>클릭 시 이동 링크</FormLabel>
                  <Input
                    value={school.link}
                    onChange={(e) => {
                      const updated = [...schoolPassers];
                      updated[index].link = e.target.value;
                      setSchoolPassers(updated);
                    }}
                    placeholder="예: /passers/karts"
                  />
                </FormRow>
              </ItemCard>
            ))}
            <SaveButtonContainer>
              <SaveButton onClick={handleSaveSchoolPassers} disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </SaveButton>
            </SaveButtonContainer>
          </>
        )}

        {/* 유튜브 영상 탭 */}
        {activeTab === 'youtube' && (
          <>
            <SectionHeader>
              <SectionTitle>유튜브 영상 설정</SectionTitle>
              <AddButton onClick={handleAddYoutube}>+ 영상 추가</AddButton>
            </SectionHeader>
            {youtubeVideos.map((video, index) => (
              <ItemCard key={index}>
                <ItemHeader>
                  <ItemTitle>영상 {index + 1}</ItemTitle>
                  <DeleteButton onClick={() => handleRemoveYoutube(index)}>삭제</DeleteButton>
                </ItemHeader>
                <FormRow>
                  <FormLabel>썸네일 이미지</FormLabel>
                  <input
                    type="file"
                    onChange={(e) => e.target.files?.[0] && handleYoutubeThumbnailUpload(index, e.target.files[0])}
                    accept="image/*"
                    style={{ display: 'none' }}
                    id={`youtube-thumb-${index}`}
                  />
                  <UploadButton onClick={() => document.getElementById(`youtube-thumb-${index}`)?.click()}>
                    이미지 선택
                  </UploadButton>
                  {video.thumbnailUrl && (
                    <SmallImagePreview src={video.thumbnailUrl} alt="썸네일" />
                  )}
                </FormRow>
                <FormRow>
                  <FormLabel>합격생 이름</FormLabel>
                  <Input
                    value={video.title}
                    onChange={(e) => {
                      const updated = [...youtubeVideos];
                      updated[index].title = e.target.value;
                      setYoutubeVideos(updated);
                    }}
                    placeholder="예: 김영희"
                  />
                </FormRow>
                <FormRow>
                  <FormLabel>서브 타이틀</FormLabel>
                  <Input
                    value={video.description}
                    onChange={(e) => {
                      const updated = [...youtubeVideos];
                      updated[index].description = e.target.value;
                      setYoutubeVideos(updated);
                    }}
                    placeholder="예: 2024 합격생 인터뷰"
                  />
                </FormRow>
                <FormRow>
                  <FormLabel>영상 링크</FormLabel>
                  <Input
                    value={video.link}
                    onChange={(e) => {
                      const updated = [...youtubeVideos];
                      updated[index].link = e.target.value;
                      setYoutubeVideos(updated);
                    }}
                    placeholder="예: https://youtube.com/watch?v=..."
                  />
                </FormRow>
              </ItemCard>
            ))}
            <SaveButtonContainer>
              <SaveButton onClick={handleSaveYoutube} disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </SaveButton>
            </SaveButtonContainer>
          </>
        )}

        {/* 강사진 탭 */}
        {activeTab === 'instructors' && (
          <>
            <SectionHeader>
              <SectionTitle>강사진 설정</SectionTitle>
              <AddButton onClick={handleAddInstructor}>+ 강사 추가</AddButton>
            </SectionHeader>
            {instructors.map((instructor, index) => (
              <ItemCard key={index}>
                <ItemHeader>
                  <ItemTitle>강사 {index + 1}</ItemTitle>
                  <DeleteButton onClick={() => handleRemoveInstructor(index)}>삭제</DeleteButton>
                </ItemHeader>
                <FormRow>
                  <FormLabel>강사 이미지</FormLabel>
                  <input
                    type="file"
                    onChange={(e) => e.target.files?.[0] && handleInstructorImageUpload(index, e.target.files[0])}
                    accept="image/*"
                    style={{ display: 'none' }}
                    id={`instructor-img-${index}`}
                  />
                  <UploadButton onClick={() => document.getElementById(`instructor-img-${index}`)?.click()}>
                    이미지 선택
                  </UploadButton>
                  {instructor.imageUrl && (
                    <SmallImagePreview src={instructor.imageUrl} alt="강사 이미지" />
                  )}
                </FormRow>
                <FormRow>
                  <FormLabel>강사 이름</FormLabel>
                  <Input
                    value={instructor.name}
                    onChange={(e) => {
                      const updated = [...instructors];
                      updated[index].name = e.target.value;
                      setInstructors(updated);
                    }}
                    placeholder="예: 김민수 강사"
                  />
                </FormRow>
                <FormRow>
                  <FormLabel>소개 (학교/전공)</FormLabel>
                  <Input
                    value={instructor.description}
                    onChange={(e) => {
                      const updated = [...instructors];
                      updated[index].description = e.target.value;
                      setInstructors(updated);
                    }}
                    placeholder="예: 한국예술종합학교 출신"
                  />
                </FormRow>
                <FormRow>
                  <FormLabel>클릭 시 이동 링크</FormLabel>
                  <Input
                    value={instructor.link}
                    onChange={(e) => {
                      const updated = [...instructors];
                      updated[index].link = e.target.value;
                      setInstructors(updated);
                    }}
                    placeholder="예: /about/instructors"
                  />
                </FormRow>
              </ItemCard>
            ))}
            <SaveButtonContainer>
              <SaveButton onClick={handleSaveInstructors} disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </SaveButton>
            </SaveButtonContainer>
          </>
        )}

        {/* 인스타그램 탭 */}
        {activeTab === 'instagram' && (
          <>
            <SectionHeader>
              <SectionTitle>학원 인스타 썸네일 설정</SectionTitle>
              <AddButton onClick={handleAddInstagram}>+ 포스트 추가</AddButton>
            </SectionHeader>
            {instagramPosts.map((post, index) => (
              <ItemCard key={index}>
                <ItemHeader>
                  <ItemTitle>포스트 {index + 1}</ItemTitle>
                  <DeleteButton onClick={() => handleRemoveInstagram(index)}>삭제</DeleteButton>
                </ItemHeader>
                <FormRow>
                  <FormLabel>썸네일 이미지</FormLabel>
                  <input
                    type="file"
                    onChange={(e) => e.target.files?.[0] && handleInstagramImageUpload(index, e.target.files[0])}
                    accept="image/*"
                    style={{ display: 'none' }}
                    id={`instagram-img-${index}`}
                  />
                  <UploadButton onClick={() => document.getElementById(`instagram-img-${index}`)?.click()}>
                    이미지 선택
                  </UploadButton>
                  {post.imageUrl && (
                    <SmallImagePreview src={post.imageUrl} alt="인스타 이미지" />
                  )}
                </FormRow>
                <FormRow>
                  <FormLabel>제목 (선택)</FormLabel>
                  <Input
                    value={post.title}
                    onChange={(e) => {
                      const updated = [...instagramPosts];
                      updated[index].title = e.target.value;
                      setInstagramPosts(updated);
                    }}
                    placeholder="예: 합격 후기"
                  />
                </FormRow>
                <FormRow>
                  <FormLabel>인스타그램 링크</FormLabel>
                  <Input
                    value={post.link}
                    onChange={(e) => {
                      const updated = [...instagramPosts];
                      updated[index].link = e.target.value;
                      setInstagramPosts(updated);
                    }}
                    placeholder="예: https://instagram.com/p/..."
                  />
                </FormRow>
              </ItemCard>
            ))}
            <SaveButtonContainer>
              <SaveButton onClick={handleSaveInstagram} disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </SaveButton>
            </SaveButtonContainer>
          </>
        )}
      </ContentBox>
    </Container>
  );
};

// Styled Components
const Container = styled.div``;

const PageTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #333;
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
  overflow-x: auto;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 12px 20px;
  background: ${(props) => (props.$active ? '#4dabf7' : 'transparent')};
  color: ${(props) => (props.$active ? 'white' : '#666')};
  border: none;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$active ? '#4dabf7' : '#f0f0f0')};
  }
`;

const ContentBox = styled.div`
  background: white;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
`;

const FormRow = styled.div`
  margin-bottom: 20px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #4dabf7;
  }
`;

const UploadButton = styled.button`
  padding: 10px 20px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  margin-bottom: 12px;

  &:hover {
    background: #e9ecef;
  }
`;

const ImagePreview = styled.div`
  margin-top: 12px;
  position: relative;
  display: inline-block;

  img {
    max-width: 300px;
    max-height: 200px;
    border-radius: 6px;
    border: 1px solid #ddd;
  }
`;

const SmallImagePreview = styled.img`
  max-width: 150px;
  max-height: 100px;
  border-radius: 4px;
  border: 1px solid #ddd;
  margin-top: 8px;
  display: block;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 12px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background: #fa5252;
  }
`;

const AddButton = styled.button`
  padding: 10px 20px;
  background: #4dabf7;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: #339af0;
  }
`;

const ItemCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
`;

const ItemTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const DeleteButton = styled.button`
  padding: 6px 12px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background: #fa5252;
  }
`;

const SaveButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
`;

const SaveButton = styled.button`
  padding: 12px 32px;
  background: #4dabf7;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: #339af0;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default ContentManagePage;
