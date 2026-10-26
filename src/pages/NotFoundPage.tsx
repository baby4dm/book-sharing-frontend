import ErrorScreen from "@/components/errors/ErrorScreen";

export default function NotFoundPage() {
  return (
    <ErrorScreen
      kind="not-found"
      description="Такої сторінки немає. Перевірте адресу або поверніться до каталогу книг."
    />
  );
}
