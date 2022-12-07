import { useEffect, useState } from "react";
import type { NextPage, GetServerSideProps } from 'next';

interface SearchCatImage {
  id: string,
  url: string,
  width: string,
  height: string
}

// SearchCatImageの配列
type SearchCatImageResponse = SearchCatImage[];

const catImages: string[] = [
  "https://cdn2.thecatapi.com/images/bpc.jpg",
  "https://cdn2.thecatapi.com/images/eac.jpg",
  "https://cdn2.thecatapi.com/images/6qi.jpg",
]

// (): string => {}
// この部分は関数の戻り値がstring型であることを明示している
const randomCatImage = (): string => {
  const index = Math.floor(Math.random() * catImages.length);
  return catImages[index];
}

// 戻り値の型付けはSearchCatImageを持ったPromiseオブジェクト
const fetchCatImage = async (): Promise<SearchCatImage> => {
  const res = await fetch('https://api.thecatapi.com/v1/images/search');
  const result = (await res.json()) as SearchCatImageResponse; // 型アサーションでSeachCatImageで構成された配列として扱う
  return result[0]; // その配列の0番目のSearchCatImage
}

// サンプルコード
/*
fetchCatImage().then((image) => {
  // fetchCatImageの戻り値を指定しないとany型になり、
  // 呼び出し側で存在しないプロパティを参照していてもコンパイル時点でエラーを発見できない
  // console.log(image.alt);
  console.log(image.url);
})
*/

interface IndexPageProps {
  initialCatImageUrl: string;
}

// const IndexPage: NextPage<IndexPageProps> = () => {}
// ↑この部分の解説
// この関数コンポーネントはNextPage型で定義していますよ、と明示している
// NextPage型の関数オブジェクトがあって、それが変数IndexPageに入っているよと言っている
// ※関数コンポーネント（functional component）の由来はReact用語
// <IndexPageProps>
// ↑この部分は関数の引数はIndexPagePropsだよと言っている（多分）

// getServerSidePropsによりpropsとしてinitialCatImageUrlが渡される
const IndexPage: NextPage<IndexPageProps> = ({initialCatImageUrl}) => {
  // const [catImageUrl, setCatImageUrl] = useState("https://cdn2.thecatapi.com/images/bpc.jpg");
  const [catImageUrl, setCatImageUrl] = useState(initialCatImageUrl);


  console.log({initialCatImageUrl});
  // { initialCatImageUrl: 'url' }

  const handleClick = async () => {
    const image = await fetchCatImage();
    // setCatImageUrl(randomCatImage());
    setCatImageUrl(image.url);
  }

  return (
    <div>
      <button onClick={handleClick}>今日の猫さん🐱</button>
      <div style={{ marginTop: 8 }}>
        <img src={catImageUrl} />
      </div>
    </div>
  );
}

// SSG（Static Site Generate, 静的生成）との違い
// SSGはビルド時にドキュメントや画像などの静的データを事前に生成しておくことで、ページ表示を高速化できる技術
// 今回はページに訪れる度にcat APIを叩いて別の猫の画像を表示したいので、SSGは適さない
// 代わりにSSRを使う

// SSR（サーバーサイドレンダリング）
// propsの値が、同一のページコンポーネント（ここではIndexPage）のpropsに渡される
export const getServerSideProps: GetServerSideProps<IndexPageProps> = async () => {
  const catImage = await fetchCatImage();
  return {
    props: {
      initialCatImageUrl: catImage.url
    }
  }
}

export default IndexPage;
