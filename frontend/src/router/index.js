import { createRouter, createWebHistory} from "vue-router";
import Demo from "@/components/demo.vue";
import FieldMaker from "@/components/FieldMaker.vue";

const routes = [
    {   path: "/",
        name: "demo",
        component: Demo
    },
    {
        path: "/field-maker/:data",
        name: "fieldMaker",
        component: FieldMaker
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;