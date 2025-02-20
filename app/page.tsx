"use client";

export default function Home() {
  return (
    <>
      {" "}
      <script>
        // 페이지가 로드되면 /todolist로 리다이렉션
        window.location.replace('/todolist');
      </script>
    </>
  );
}
