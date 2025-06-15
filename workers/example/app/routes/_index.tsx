export default function Route() {
  return (
    <div>
      Hello world
      <MyAsyncComponent />
    </div>
  );
}

const MyAsyncComponent = async () => {
  const data = await fetch("https://jsonplaceholder.typicode.com/posts/1");
  const json = await data.json();
  return <pre>{JSON.stringify(json, null, 2)}</pre>;
};
