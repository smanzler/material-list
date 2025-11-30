import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  return (
    <div>
      <main className="max-w-2xl mx-auto p-20">
        <form className="flex flex-col gap-4">
          <Field>
            <FieldLabel>Material List</FieldLabel>
            <FieldContent>
              <Textarea placeholder="Enter your material list here" />
            </FieldContent>
          </Field>
          <Button>Generate List Image</Button>
        </form>
      </main>
    </div>
  );
}
