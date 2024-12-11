import { Entity, Fields } from "remult";

function isValidURL(input: string) {
	if (typeof input !== "string") return false;
	let fallbackHost: string | undefined;
	if (input.startsWith("localhost")) input = `http://${input}` as string;
	// Handle relative paths
	if (input.startsWith("/")) fallbackHost = "http://localhost";
	// Validate absolute URLs
	try {
		const url = new URL(input, fallbackHost);
		// if we didn't throw yet, we have a valid URL but we require https or localhost
		return url.protocol === "https:" || url.origin.startsWith("http://localhost");
	} catch {
		return false;
	}
}

@Entity("tasks", {
  allowApiCrud: true,
})
export class Task {
  @Fields.cuid()
  id = "";

  @Fields.string<Task, string>({
		validate: (input, context) => {
			console.log("validating url string:", input);
			if (isValidURL(input.url)) return true;
			throw new Error("Valid URLs must start with https:// or / or localhost");
		},
	})
	url = "";

  @Fields.boolean()
  completed = false;

  @Fields.createdAt()
  createdAt?: Date;
}
