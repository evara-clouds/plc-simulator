// Trainers are the emails listed in the TRAINER_EMAILS environment variable (comma separated).
export const isTrainer = (u) => !!u?.email && (process.env.TRAINER_EMAILS || "").toLowerCase().split(",").map((s) => s.trim()).includes(u.email.toLowerCase());
