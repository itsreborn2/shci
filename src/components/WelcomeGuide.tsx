import Image from 'next/image';

const GuideCard = ({ imgSrc, title, description, index }: { imgSrc: string; title: string; description: string; index: number }) => {
  // 2번, 3번 카드(index 1, 2)는 다른 aspect ratio를 적용하여 상하 여백을 줄입니다.
  const aspectRatioClass = (index === 1 || index === 2) ? 'aspect-[2.4/1]' : 'aspect-video';

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-shadow duration-300 hover:shadow-2xl">
      <div className="p-6">
        <h3 className="text-2xl font-bold text-cyan-600">{title}</h3>
      </div>
      <div className={`w-full relative bg-gray-100 ${aspectRatioClass}`}>
          <Image
            src={imgSrc}
            alt={title}
            layout="fill"
            objectFit="contain"
            className="p-2"
          />
      </div>
      <div className="p-6">
        <p className="text-gray-700 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

const WelcomeGuide = () => {
  const guides = [
    {
      imgSrc: '/images/guide-search.png',
      title: '1. 채무자 정보 검색',
      description: '법인명과 대표자명을 입력해야 검색이 시작됩니다. 입력 후 엔터키를 누르면 다음 입력칸으로 이동되고, 대표자명 입력 후 엔터를 누르면 바로 검색이 진행됩니다.',
    },
    {
      imgSrc: '/images/guide-ongoing.png',
      title: '2. 진행중인 수주 검색 결과',
      description: '공사 기간이 도래하지 않은, 권리 행사가 가능한 공사건입니다.',
    },
    {
      imgSrc: '/images/guide-completed.png',
      title: '3. 완료된 수주 검색 결과',
      description: '오늘 날짜 기준으로 이미 공사가 완료된 기록입니다. 1년 이내의 기록을 보여주며, 기록이 많을수록 활발한 사업 영위를 의미합니다.',
    },
    {
      imgSrc: '/images/guide-research.png',
      title: '4. AI 기업 리서치 결과',
      description: '법인명과 대표자명으로 AI 리서치를 진행한 결과로, 회사에 대한 전반적인 정보를 보여줍니다. (기업에 따라 1~2분 가량 소요될 수 있습니다.)',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto mt-8 mb-16 px-4">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-gray-800">사용 가이드</h2>
        <p className="text-gray-500 mt-2">검색을 시작하기 전, 각 결과 섹션의 의미를 확인해보세요.</p>
      </div>
      <div className="flex flex-col gap-10">
        {guides.map((guide, index) => (
          <GuideCard key={index} index={index} {...guide} />
        ))}
      </div>
    </div>
  );
};

export default WelcomeGuide;
