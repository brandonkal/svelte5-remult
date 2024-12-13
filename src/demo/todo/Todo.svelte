<script lang="ts">
  import { EntityError, Remult, repo } from "remult";
  import { Module } from "./entities";
  import Tile from "../Tile.svelte";
  import { createSubscriber } from "svelte/reactivity";

  let formError = $state("");

  let tasks: Module[] = $state([]);
  let hideCompleted = $state(false);
  function toggleHideCompleted() {
    hideCompleted = !hideCompleted;
  }

  // To be done once in the application ? To be imported from remult/svelte ?
  function initRemultSvelteReactivity() {
    Remult.entityRefInit = (x) => {
      let update = () => {};
      let s = createSubscriber((u) => {
        update = u;
      });
      x.subscribe({
        reportObserved: () => s(),
        reportChanged: () => update(),
      });
    };
  }
  initRemultSvelteReactivity();

  $effect(() => {
    return repo(Module)
      .liveQuery({
        where: {
          completed: hideCompleted ? false : undefined,
        },
        orderBy: {
          createdAt: "desc",
        },
      })
      .subscribe((info) => {
        tasks = info.applyChanges(tasks);
      });
  });

  // let newModuleTitle = $state('')
  // let editingModule = $state({ ...new Module() });
  // This creates the EntityRef
  let editingModule = $state(repo(Module).create());

  let formHasEmpty = $derived(!editingModule || editingModule.url.length === 0);

  const saveModule = async (event: Event) => {
    event.preventDefault();
    try {
      // if (editingModule.id) {
      //   const modRef = tasks.find((m) => m.id === editingModule.id);
      //   await repo(Module).update(modRef || editingModule, editingModule);
      //   editingModule = { ...new Module() };
      //   formError = "";
      // } else {
      //   await repo(Module).insert(editingModule);
      //   editingModule = { ...new Module() };
      //   formError = "";
      // }
      await repo(Module).save(editingModule);
      editingModule = repo(Module).create();
      formError = "";
    } catch (error) {
      if (error instanceof EntityError) {
        formError = error.message;
      } else {
        formError = "An unknown error occurred";
      }
    }
  };

  const setCompleted = async (task: Module, completed: boolean) => {
    return await repo(Module).update(task, { completed });
  };

  const editModule = async (mod: Module) => {
    // editingModule = mod; // This keeps the same signal reference, we probably don't want this
    editingModule = repo(Module).getEntityRef(mod).clone();
    // editingModule = { ...mod }; // This is what causes the client to always perform a PUT even if URL is invalid!
  };
</script>

<Tile
  title="Todos"
  subtitle="Enter a URL"
  icon=""
  width="full"
  className="todo"
  status="Info"
>
  <main>
    <form onsubmit={saveModule}>
      <input
        bind:value={editingModule.url}
        placeholder="What needs to be done?"
        type="text"
      />
      <button type="submit" disabled={formHasEmpty}>
        <img src="plus.svg" alt="Add" />
      </button>
    </form>
    {#if formError.length > 0}
      <span style="color: red;">
        {formError}
      </span>
    {/if}
    {#each tasks as task, i}
      <div class="todo__task {task.completed ? 'completed' : ''}">
        <input
          id={task.id}
          type="checkbox"
          checked={task.completed}
          oninput={async (e) => {
            tasks[i] = await setCompleted(task, e.currentTarget.checked);
          }}
        />
        <span>
          <label for={task.id}>{task.url}</label>
        </span>
        <button onclick={() => editModule(task)}> Edit </button>
      </div>
    {/each}
  </main>
  <div class="button-row">
    <button onclick={toggleHideCompleted}>
      {hideCompleted ? "Show" : "Hide"} completed
    </button>
  </div>
</Tile>
