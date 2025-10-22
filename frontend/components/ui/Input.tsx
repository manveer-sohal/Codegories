import { CreateLobbyFormStatus, JoinRoomFormStatus } from "@/types/FormStatus";
function Input({
  value,
  onChange,
  placeholder,
  error,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  error?: JoinRoomFormStatus | CreateLobbyFormStatus;
}) {
  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <input
        className="flex-1 rounded-md bg-black/40 border border-white/15 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
      />
    </div>
  );
}

export default Input;
